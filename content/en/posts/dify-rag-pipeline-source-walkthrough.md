---
title: "Dify Source Walkthrough 01: RAG Pipeline"
date: "2026-04-10"
summary: "After spending two days taking apart Dify's RAG Pipeline, I found that the gap between an industrial system and a practice project lies less in the algorithms than in engineering details such as parent-child chunking, concurrent retrieval, and fast failure."
image: /picture/Dify-RAG.png
tags: ["Dify", "RAG"]
sourceSlug: "花两天拆了_Dify_RAG_源码_跟自己的RAG对比后_才知道差距在哪"
---


> I am a third-year university student who came to AI from a non-CS background in optoelectronics. I previously built my own RAG system with FAISS + BM25 + RRF + BGE-Reranker. Recently, I spent two days going through the `api/core/rag/` directory of the open-source Dify project from beginning to end because I wanted to see exactly how an industrial RAG Pipeline differs from the one I wrote myself. This article contains my walkthrough notes and reflections—the perspective of a student repeatedly realizing, "So it can be done this way."

### Why I Chose Dify

I chose Dify for three reasons. First, it is one of the LLM application development platforms with the most stars on GitHub, and RAG is one of its core capabilities. Second, I had already built a RAG project myself, so I had enough practical grounding not to be completely lost while reading the source. Third, my target field is AI Agent development. Dify has not only RAG but also a complete Agent framework, and I plan to continue by taking apart its workflow module. Starting with the familiar RAG code gave me a feel for the codebase as a whole.

### Overall Architecture: Two Independent Pipelines

When Dify's RAG system is taken apart, it is essentially two completely independent pipelines orchestrated by different callers at the upper layer.

**Offline indexing pipeline**—after we upload a document in Dify, the backend first extracts plain text from formats such as PDF and Word. It then cleans the text by removing HTML tags, excess whitespace, and URLs, recursively chunks it, runs the chunks through an indexing processor that orchestrates parent-child segmentation, calls an embedding API to vectorize them, and finally writes them to the vector database and keyword index. The whole pipeline is orchestrated as an asynchronous Celery task. The "Processing" state we see in the UI is this task running.

**Online retrieval pipeline**—when a user asks a question, `dataset_retrieval.py` synchronously orchestrates the entire process. It first uses routing to select which knowledge base to query if several are attached. It then runs vector retrieval and full-text retrieval concurrently through a ThreadPool. After the two result sets are deduplicated, they are sent to Rerank for fused ranking, and the final context is assembled and passed to the LLM to generate an answer.

<!-- Illustration placement: Dify RAG architecture flowchart (the hand-drawn-style image above was generated with Claude) -->

The modules under `rag/` do not know their own execution order; they are simply a toolbox. The design principle is very clear—each module does its own job, while orchestration is left to the upper layer.

### Module-by-Module Walkthrough: Five Key Design Decisions

#### 1. Chunking: Recursive Fallback + Parent-Child Segmentation

The core of Dify's chunking is `RecursiveCharacterTextSplitter`, which follows a recursive fallback strategy. It first tries to split on double newlines, `\n\n`. If a segment is still too long, it falls back to a single newline, `\n`; if that still does not work, it uses spaces, and finally falls back to individual characters. This makes it possible to split at natural paragraph boundaries whenever possible.

What truly made me think, "So it can be done this way," however, was **parent-child segmentation**. All chunks in my RAG 2.0 are peers, and in practice this always creates a conflict: if chunks are too small, retrieval is precise but there is not enough context, so the LLM gives an incomplete answer; if chunks are too large, there is enough context but retrieval becomes less precise. Dify's solution is to call the splitter twice. The first pass creates parent chunks at a larger granularity, such as 1,024 characters. The second pass splits each parent chunk into child chunks at a smaller granularity, such as 512 characters, and attaches the child chunks to the parent through the `children` property. During retrieval, the smaller child chunks are matched for precision; when a result is returned, the entire parent chunk is included to preserve complete context.

The core is just three lines:
```python
document_nodes = splitter.split_documents([document])       # Split parent chunks
child_nodes = self._split_child_nodes(document_node, ...)   # Split child chunks
document_node.children = child_nodes                        # Link them together
```

This approach is called Small-to-Big. I had seen it in papers, but seeing it implemented in industrial code felt completely different.

#### 2. Retrieval: Concurrent ThreadPool Execution + Fast Failure

In hybrid retrieval, the `if` conditions for vector retrieval and full-text retrieval sit alongside each other rather than using `elif`. Both tasks are submitted to `ThreadPoolExecutor` at the same time, and each is processed as soon as it completes through `as_completed`, without waiting on the other.

One engineering detail left a strong impression on me: the timeout is 300 seconds, and if either retrieval path throws an error, all other tasks are cancelled immediately so the system fails fast.

```python
for future in concurrent.futures.as_completed(futures, timeout=300):
    if future.exception():
        for f in futures: f.cancel()
        break
```

My RAG 2.0 also used both FAISS and BM25 retrieval, but honestly, I implemented almost no error handling. This code made me realize that the difference between industrial code and a practice project often lies not in the algorithms but in engineering details like these.

#### 3. Rerank: Why Dify Uses TF-IDF Instead of BM25

This was the biggest surprise in my source walkthrough. In Dify's weighted fusion strategy, `weight_rerank`, keyword scoring uses TF-IDF + cosine similarity rather than the more common BM25.

The reason is actually straightforward: **normalization**. After cosine similarity is calculated, TF-IDF scores naturally fall between [0, 1], on the same scale as the cosine similarity from vector retrieval. They can therefore be combined directly in a weighted sum, such as `0.7 × vector score + 0.3 × keyword score`. BM25 scores do not have a fixed range, so they cannot be weighted directly against vector scores. An additional normalization step would be required, adding more processing while remaining less stable.

By contrast, the RRF fusion used in my RAG 2.0 avoids this problem altogether. RRF looks only at rank, not score—`1/(k + rank)`—so it is inherently insensitive to score scales. The tradeoff is that it discards absolute score information.

Dify also supports another strategy: calling an external Rerank model such as Cohere or BGE and using a cross-encoder to score every query-document pair interactively. A cross-encoder is more accurate than a bi-encoder because the query and document enter the model together, allowing it to observe their interactions rather than encoding each independently and calculating cosine similarity afterward.

<!-- Illustration placement: comparison table for weight_rerank vs rerank_model vs RAG 2.0 -->

#### 4. Deduplication: A Two-Layer Safety Net

Dify performs deduplication in two places. During indexing, every chunk receives a `doc_hash`, a content hash used as its identifier. After retrieval and before reranking, `_deduplicate_documents()` performs another round of deduplication based on `doc_id`.

In theory, the first pass should be enough, so why add a second? In hybrid retrieval, vector retrieval and full-text retrieval may both return the same chunk. The first pass prevents duplicate writes at the index level; the second prevents duplicate chunks from being sent to rerank at query time. Together they ensure that the same chunk is not scored twice and does not distort ranking fairness.

#### 5. Embedding Cache: Saving API Costs with Content Hashes

The design of `cached_embedding.py` is very practical. Instead of calling the API to recalculate an embedding every time, it first looks up the cache using a content hash. A cache hit is returned directly; only a miss triggers the API call, after which the result is cached. If the content of a chunk has not changed, why pay to process it again? It is the same idea as using SHA1 to deduplicate titles in my Auto-Tweet-Agent—unchanged content should not be processed repeatedly.

### Comparing It with My RAG 2.0

After finishing the walkthrough, I put together this comparison:

| Dimension | Dify RAG | My RAG 2.0 |
|------|----------|-------------|
| Chunking | Recursive fallback + parent-child segmentation | Fixed-length chunks, all at the same level |
| Vector database | Adapter pattern with support for 30+ options | FAISS IndexFlatIP only |
| Retrieval | Concurrent ThreadPool execution with thorough error handling | Serial execution with almost no error handling |
| Fusion | Weighted TF-IDF cosine scores / Rerank model | RRF(k=60) + BGE-Reranker |
| Deduplication | Two layers at indexing and query time | RRF naturally handles some deduplication |
| Cache | Embedding cache using content hashes | No cache |

The main gap lies in engineering maturity rather than algorithms. At the algorithmic level, my RRF + BGE-Reranker is not necessarily worse than Dify, but Dify is far more thorough in engineering details such as error handling, caching, adapter abstractions, and deduplication guarantees.

### Three Designs Worth Adopting

**Parent-child segmentation** resolves the conflict between retrieval precision and context length. I plan to introduce this idea in my next iteration. The implementation cost is not high—call the splitter twice and add a `children` field—but it can significantly improve cases where the right content is retrieved yet the answer remains incomplete.

**Embedding caching** uses a content hash as the key to save API costs. In scenarios where knowledge bases are updated frequently, such as incremental indexing, the content of most chunks has not actually changed. A cache can eliminate a large number of repeated calls.

**Fast failure** is especially important in concurrent retrieval. If any path times out or fails, the others should be cancelled immediately instead of leaving the user waiting. This kind of defensive programming is something I had been missing.

### Closing Thoughts

This is the first article in my "Dify Source Walkthrough" series. Next, I plan to continue with the Agent modules under `api/core/workflow/`. If you are also learning RAG or Agent development, I hope these notes offer a useful reference. Of course, this is not an authoritative interpretation—just the learning record of a university student, haha.

If you have other views on the tradeoffs in RAG design, feel free to share them in the comments.

By the way, I am currently looking for an internship in AI Agent development. If your team is working in this area, I would be glad to connect.

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agents*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
