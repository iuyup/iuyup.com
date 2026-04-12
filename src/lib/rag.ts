import fs from "fs";
import path from "path";

const POSTS_PATH = path.join(process.cwd(), "content/posts");

export interface Chunk {
  content: string;
  filename: string;
  title: string;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
}

// 简单中文分词：按标点和空格分割
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[[\]{}【】（）(),。！？、；：「」""''《》<>]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

// 计算词频权重（TF）
function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // 归一化
  const maxFreq = Math.max(...tf.values(), 1);
  for (const [token, freq] of tf) {
    tf.set(token, freq / maxFreq);
  }
  return tf;
}

// 计算IDF（基于整个语料库）
function computeIDF(allTokens: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const docCount = allTokens.length;
  const docFreq = new Map<string, number>();

  for (const tokens of allTokens) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  for (const [token, freq] of docFreq) {
    idf.set(token, Math.log(docCount / (freq + 1)) + 1);
  }
  return idf;
}

// 计算 TF-IDF 分数
function computeScore(queryTokens: string[], chunkTokens: string[], idf: Map<string, number>): number {
  const chunkTF = computeTF(chunkTokens);
  let score = 0;
  for (const token of queryTokens) {
    if (chunkTF.has(token)) {
      score += chunkTF.get(token)! * (idf.get(token) || 1);
    }
  }
  return score;
}

// 去掉 Obsidian 特殊语法
function stripObsidianSyntax(content: string): string {
  return content
    .replace(/!\[\[([^\]]+)\]\]/g, "$1") // ![[嵌入]] -> 内容
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2 || $1") // [[双链|别名]] -> 别名或双链
    .replace(/#[a-zA-Z0-9_-]+/g, "") // 去除标签 #tag
    .replace(/%\d{2,4}%?/g, "") // 去除百分比高亮 %^text%
    .replace(/\$\$[\s\S]*?\$\$/g, "") // 去除 LaTeX
    .replace(/\$[^$\n]+\$/g, ""); // 去除行内 LaTeX
}

// 去掉 frontmatter
function stripFrontmatter(content: string): string {
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---\n?/);
  if (frontmatterMatch) {
    return content.slice(frontmatterMatch[0].length).trim();
  }
  return content;
}

// 按段落或每500字切块
function chunkText(text: string, filename: string, title: string): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 50);

  let currentChunk = "";
  for (const para of paragraphs) {
    const cleaned = para.trim();
    if (currentChunk.length + cleaned.length > 500) {
      if (currentChunk) {
        chunks.push({ content: currentChunk, filename, title });
      }
      currentChunk = cleaned;
    } else {
      currentChunk += "\n\n" + cleaned;
    }
  }
  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), filename, title });
  }
  return chunks;
}

// 加载并索引所有博客文章
let cachedChunks: Chunk[] | null = null;

function loadChunks(): Chunk[] {
  if (cachedChunks) return cachedChunks;

  const chunks: Chunk[] = [];

  try {
    const files = fs.readdirSync(POSTS_PATH).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filepath = path.join(POSTS_PATH, file);
      const raw = fs.readFileSync(filepath, "utf-8");
      const content = stripObsidianSyntax(stripFrontmatter(raw));

      // 从文件名提取标题
      const title = file.replace(/\.md$/, "").replace(/_/g, " ");

      const fileChunks = chunkText(content, file, title);
      chunks.push(...fileChunks);
    }
  } catch (error) {
    console.error("Error loading posts:", error);
  }

  cachedChunks = chunks;
  return chunks;
}

// 搜索最相关的 chunk
export function searchRelevantChunks(query: string, topK: number = 5): SearchResult[] {
  const chunks = loadChunks();
  if (chunks.length === 0) return [];

  const queryTokens = tokenize(query);

  // 预计算所有 chunk 的 tokens 和 IDF
  const allChunkTokens = chunks.map((chunk) => tokenize(chunk.content));
  const idf = computeIDF(allChunkTokens);

  // 计算每个 chunk 的分数
  const scored = chunks.map((chunk, i) => ({
    chunk,
    score: computeScore(queryTokens, allChunkTokens[i], idf),
  }));

  // 按分数排序，返回 topK
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// 构建带 RAG 上下文的 system prompt
export function buildRAGSystemPrompt(basePrompt: string, query: string): string {
  const results = searchRelevantChunks(query, 5);

  if (results.length === 0) {
    return basePrompt;
  }

  const ragContext = results
    .map(
      (r) =>
        `【来源：${r.chunk.title}】\n${r.chunk.content}`
    )
    .join("\n\n---\n\n");

  return `${basePrompt}

以下是 T 的文章中与当前话题相关的内容，回答时可以参考：
---
${ragContext}
---`;
}
