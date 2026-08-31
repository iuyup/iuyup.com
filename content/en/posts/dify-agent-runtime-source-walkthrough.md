---
title: "Dify Source Walkthrough 02: Agent Runtime"
date: 2026-04-10
summary: "A layer-by-layer walkthrough of Dify's three-tier Agent architecture, from graphon to the workflow glue layer and the legacy Agent runner, compared with the design gaps in my own LangGraph system."
image: /picture/Dify-Agent.png
tags:
  - Dify
  - Agent
sourceSlug: "拆完_Dify_RAG_源码后_我把Agent模块扒了一遍"
---


> This is the second article in my "Dify Source Walkthrough" series. In the previous article, we took apart the RAG Pipeline. This time, it is the Workflow engine and Agent modules. I am a third-year university student who came to AI from a non-CS background, and I previously built a seven-node Multi-Agent system with LangGraph, the Auto-Tweet Agent. I took apart Dify's Agent code because I wanted to see how an industrial Agent framework actually differs from one I wrote by hand.

### Dify's Agent Architecture: Three Layers

Before reading the source, I assumed Dify's Workflow and Agent were a single module. After taking them apart, I found three layers instead:

**Layer 1: graphon (external package)** — a general-purpose graph execution engine responsible for DAG scheduling, concurrent node execution, and event-stream management. It plays the role of LangGraph. However, graphon has been extracted into a standalone pip package and is not part of Dify's main repository. Its source can only be read after running `pip install graphon`.

**Layer 2: api/core/workflow/** — a glue layer that Dify wraps around graphon. Its entry point is `workflow_entry.py`, its node factory is `node_factory.py`, and business nodes such as Agent and knowledge-base retrieval live under `nodes/`.

**Layer 3: api/core/agent/** — the legacy Agent runner, containing complete implementations of both Function Call and Chain-of-Thought reasoning modes. This layer is being replaced by the new plugin system, but the core reasoning logic remains and is well worth reading.

Their relationship can be summarized in one sentence: graphon is the engine, workflow is the body of the car, and agent is the older engine model—it still runs, but it is being replaced.

<!-- Illustration placement: diagram of the three-layer architecture -->

### Five Key Designs

#### 1. The Middleware/Onion Model: Layers

When `workflow_entry.py` creates a GraphEngine, it stacks multiple Layers:

```python
self.graph_engine.layer(debug_layer)          # Debug logging
self.graph_engine.layer(limits_layer)         # Execution limits (maximum steps/time)
self.graph_engine.layer(LLMQuotaLayer())      # LLM quota control
self.graph_engine.layer(ObservabilityLayer()) # Observability
```

Each Layer wraps the engine, and node execution passes through them one by one, following the same idea as middleware in Express or Koa. For example, `ExecutionLimitsLayer` controls the maximum number of Workflow steps and the longest allowed runtime, forcibly stopping execution when either limit is exceeded.

My LangGraph Agent has no such mechanism. The maximum number of Reflection Loop rounds is hardcoded. If I wanted to add execution-time limits or token quota control, I would have to write `if` checks inside every node. Dify's Layer pattern is much more elegant: it separates concerns and completely decouples business logic from operational logic.

#### 2. The Dependency Injection Container: node_factory

`node_factory.py` is the most thoroughly "engineered" file in the entire Workflow layer. Its core idea is:

```python
node_init_kwargs_factories = {
    "llm":   lambda: { model_instance, memory, credentials },
    "code":  lambda: { code_executor, code_limits },
    "agent": lambda: { strategy_resolver, message_transformer },
    "http":  lambda: { http_client, file_manager },
}
```

All dependencies are prepared when the Factory is initialized. When a user drags an LLM node onto the canvas, the Factory looks up the dependencies required by that node type—model instance, memory, and credentials—and injects them into the node instance. The node itself does not need to know where those dependencies came from.

An analogy would be a delivery kitchen: all ingredients are prepared in advance. When you order "beef fried rice," the kitchen checks the recipe, sees that it needs rice, beef, and eggs, and takes only those ingredients to prepare your meal.

In my LangGraph system, node dependencies are passed manually and hardcoded into the program. Dify's factory plus dictionary-mapping approach is far more extensible: adding a new node type requires only one additional line in the dictionary.

#### 3. Agent Nodes: Pluggable Strategies

This design surprised me the most. I expected `agent_node.py` to contain the complete Agent reasoning logic—the loop that calls the LLM, selects tools, executes tools, and so on. When I opened it, however, the core code had only three steps:

```python
strategy = self._strategy_resolver.resolve(...)  # Load a strategy from the plugin system
message_stream = strategy.invoke(...)             # Invoke the plugin to perform reasoning
yield from self._message_transformer.transform(...)  # Transform the output
```

Agent reasoning strategies such as ReAct, Function Call, and CoT are not hardcoded here. They exist as plugins and are loaded dynamically through a Protocol interface. Any plugin that implements the two methods `get_parameters()` and `invoke()` can be called by AgentNode. A plugin author does not even need to import the Protocol as long as the method signatures match. This is Python's "duck typing": if it looks like a duck, it is a duck.

The seven nodes in my LangGraph Agent are written directly into the StateGraph, so adding a node requires changing the orchestration code. In Dify, installing a new plugin adds another Agent strategy without changing a single line in the main repository.

#### 4. FC and CoT: A Complete Comparison of Two Reasoning Modes

The legacy Agent directory preserves complete implementations of both modes. The central difference between FC and CoT is how they tell the code which tool to invoke:

**FC (Function Call)**: the LLM natively returns a structured `tool_calls` field that the code reads directly. One line is enough:
```python
tool_calls = chunk.delta.message.tool_calls
```

**CoT (Chain-of-Thought / ReAct)**: the LLM outputs free-form text. A prompt guides it to use a `Thought/Action/Action Input` format, and then a character-by-character state-machine parser of more than 200 lines extracts the tool-call information from that text.

For the same task—"use the weather tool to check Beijing's weather"—FC is like ordering from a tablet, where the system receives a structured order directly. CoT is like telling a waiter, "I want a bowl of spicy beef noodles," after which the waiter manually records it as an order. The kitchen ultimately receives the same order and prepares the same dish; only the ordering method differs.

The fundamental reason FC is more stable than CoT is that FC delegates parsing complexity to the model provider, whose model guarantees structured output, while CoT keeps that complexity in the application itself. Dify's strategy is therefore to prefer FC when the model supports Function Call and fall back to CoT/ReAct only when it does not.

#### 5. A Three-Layer Exit Safety Net

The main loops for both FC and CoT use three safeguards for exiting:

```python
# Layer 1: normal exit
# FC: the LLM returns no tool_calls → function_call_state = False → exit
# CoT: the LLM outputs "Final Answer" → exit

# Layer 2: forced exit
if iteration_step == max_iteration_steps:
    prompt_messages_tools = []  # Clear the tool list, forcing the LLM to answer directly

# Layer 3: exception fallback
if iteration_step == max_iteration_steps and tool_calls:
    raise AgentMaxIterationError(...)  # The final round still requests a tool, so raise an exception
```

My Reflection Loop has only a hard `max_rounds = 2` limit, without the graceful degradation strategy of clearing the tools and forcing a direct answer.

### Comparing It with My LangGraph Agent

| Dimension | Dify Agent | My LangGraph Agent |
| ---- | ---------------------------- | -------------------- |
| Graph engine | graphon (thread pool + ReadyQueue scheduling) | LangGraph (supports parallelism, but it must be declared) |
| Middleware | Layer-based onion model | None; I would have to wrap it myself |
| Node creation | Factory pattern + dependency injection | Manual `add_node` calls |
| Strategy switching | Plugins through a Protocol interface | Hardcoded in the StateGraph |
| Reasoning modes | Configurable FC / CoT | Fixed Reflection Loop |
| Exit mechanism | Three-layer safety net | A single `max_rounds` limit |
| History management | Persisted in PostgreSQL, including tool-call records | A `messages` list in state |
| Knowledge base | Wrapped as a tool, with the Agent deciding whether to call it | No knowledge-base integration |

The conclusion is still the same: **the algorithmic gap may not be that large, but the engineering gap is obvious**. My Reflection Loop, where Writer and Reviewer critique each other, is an Agent design pattern that Dify does not have. But Dify is far more thorough than I was in extensibility, fault tolerance, and observability.

### Three Design Principles I Learned

**Plugin over Hardcode.** Agent strategies should not be hardcoded. An interface such as a Protocol should define the contract, with concrete implementations loaded as plugins. This allows new strategies to be added without changing the core code.

**Use Layers to separate concerns.** Cross-cutting concerns such as execution limits, quota control, and debug logging should not be scattered across every node. Middleware should handle them in one place.

**A knowledge base is a tool, not a fixed pipeline.** Dify wraps knowledge-base retrieval as a tool and lets the Agent decide, "Do I need to query the knowledge base?" rather than forcing every query through RAG. This is much more flexible than the knowledge base I rigidly attached to my chat assistant.

### Closing Thoughts

This brings my Dify source walkthrough series to a temporary close. These two articles covered the two core areas of the RAG Pipeline and Workflow/Agent. If you are also learning Agent development, I hope these notes offer a useful reference, haha.

I am currently looking for an internship in AI Agents / LLM applications. I have source-level familiarity with Dify, practical experience building a LangGraph multi-agent system, and an open-source project, AgentFlow (github.com/iuyup/AgentFlow).

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agents*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
