---
title: Dify 源码拆解 02：Agent Runtime
date: 2026-04-10
summary: 从 graphon 到 workflow 胶水层再到旧版 Agent 运行器，逐层拆解 Dify 的三层 Agent 架构，对比自建 LangGraph 系统的设计差距。
image: /picture/Dify-Agent.png
tags:
  - Dify
  - Agent
---


> 这是"Dify 源码拆解"系列的第二篇。上一篇我们拆了 RAG Pipeline，这次轮到 Workflow 引擎和 Agent 模块。我是一个非科班转 AI 的大三在校生，之前用 LangGraph 搭过一个 7 节点的 Multi-Agent 系统（Auto-Tweet Agent）。这次拆 Dify 的 Agent，就是想看看工业级的 Agent 框架跟我自己手写的到底有什么区别。

### Dify 的 Agent 架构：三层结构

拆之前我以为 Dify 的 Workflow 和 Agent 是一个模块。拆完才发现，它其实是三层：

**第一层：graphon（外部包）** — 通用图执行引擎，负责 DAG 调度、节点并发执行、事件流管理。相当于 LangGraph 的角色。但是 graphon 已被抽成独立 pip 包，不在 Dify 主仓库目录里， 只有 `pip install graphon` 后才可以读源码。

**第二层：api/core/workflow/** — Dify 在 graphon 上面包的一层胶水。入口是 `workflow_entry.py`，节点工厂是 `node_factory.py`，业务节点（Agent、知识库检索等）在 `nodes/` 目录下。

**第三层：api/core/agent/** — 旧版 Agent 运行器，包含 Function Call 和 Chain-of-Thought 两种推理模式的完整实现。这层正在被新版的插件系统替代，但核心推理逻辑还在，非常值得读。

三者的关系一句话概括：graphon 是发动机，workflow 是车壳，agent 是旧款发动机（还能跑但在被替换）。

<!-- 插图位置：三层架构关系图 -->

### 五个关键设计

#### 1. 中间件/洋葱模型：Layer 机制

`workflow_entry.py` 里创建 GraphEngine 时，会叠加多层 Layer：

```python
self.graph_engine.layer(debug_layer)          # 调试日志
self.graph_engine.layer(limits_layer)         # 执行限制（最大步数/时间）
self.graph_engine.layer(LLMQuotaLayer())      # LLM 配额控制
self.graph_engine.layer(ObservabilityLayer()) # 可观测性
```

每个 Layer 包裹在引擎外面，节点执行时依次经过每一层，跟 Express/Koa 的中间件是同一个思路。比如 `ExecutionLimitsLayer` 控制 Workflow 最多跑多少步、最长跑多久，超了就强制停止。

我的 LangGraph Agent 没有这种机制，Reflection Loop 的最大轮次是硬编码的。如果要加执行时间限制、token 配额控制，就得自己在每个节点里写 if 判断。Dify 的 Layer 模式优雅得多——关注点分离，业务逻辑和运维逻辑完全解耦。

#### 2. 依赖注入容器：node_factory

`node_factory.py` 是整个 Workflow 层最"工程化"的一个文件。核心思路是：

```python
node_init_kwargs_factories = {
    "llm":   lambda: { model_instance, memory, credentials },
    "code":  lambda: { code_executor, code_limits },
    "agent": lambda: { strategy_resolver, message_transformer },
    "http":  lambda: { http_client, file_manager },
}
```

所有依赖在 Factory 初始化时就准备好了。用户在画布上拖一个 LLM 节点，Factory 根据节点类型从字典里取出 LLM 需要的依赖（模型实例、记忆、凭证），注入到节点实例中。节点本身不用关心这些依赖从哪来。

类比的话，就像外卖厨房——所有食材提前备好，你下单说"牛肉炒饭"，厨房查菜谱知道需要米饭+牛肉+鸡蛋，只取需要的食材做出来给你。

我的 LangGraph 里节点依赖是手动传参的，写死在代码里。Dify 这种工厂+字典映射的方式扩展性好很多——新增一种节点，只需要在字典里加一行。

#### 3. Agent 节点：策略插件化

这是让我最意外的设计。我以为 `agent_node.py` 里会有完整的 Agent 推理逻辑（循环调用 LLM、选工具、执行工具……），结果打开一看，核心代码就三步：

```python
strategy = self._strategy_resolver.resolve(...)  # 从插件系统加载策略
message_stream = strategy.invoke(...)             # 调用插件执行推理
yield from self._message_transformer.transform(...)  # 转换输出
```

Agent 的推理策略（ReAct、Function Call、CoT）不是硬编码在这里的，而是以插件形式存在，通过 Protocol 接口动态加载。任何插件只要实现了 `get_parameters()` 和 `invoke()` 两个方法，就能被 AgentNode 调用——插件作者甚至不需要导入这个 Protocol，只要方法签名对得上就行。这就是 Python 的"鸭子类型"，看起来像鸭子就是鸭子。

我的 LangGraph Agent 的 7 个节点是直接写死在 StateGraph 里的，新增节点要改编排代码。Dify 装一个新插件就多一种 Agent 策略，不用改一行主仓库代码。

#### 4. FC 和 CoT：两种推理模式的完整对比

旧版 Agent 目录里保留了完整的实现，FC 和 CoT 的核心差异在于"怎么告诉代码要调什么工具"：

**FC（Function Call）**：LLM 原生返回结构化的 `tool_calls` 字段，代码直接读取。一行搞定：
```python
tool_calls = chunk.delta.message.tool_calls
```

**CoT（Chain-of-Thought / ReAct）**：LLM 输出自由文本，靠 prompt 引导输出 `Thought/Action/Action Input` 格式，然后用一个 200+ 行的逐字符状态机解析器从文本中提取工具调用信息。

同样是"调天气工具查北京天气"，FC 就像在平板上点菜，系统直接收到结构化订单；CoT 就像口头跟服务员说"我要一碗牛肉面加辣"，服务员听完手动记录成订单。最终厨房收到的订单一样，做出来的菜也一样，只是下单方式不同。

FC 比 CoT 稳定的根本原因在于FC 把解析的复杂度交给了模型厂商（模型内部保证输出结构化的结果），而CoT 把这个复杂度留给了自己。所以 Dify 的策略是：模型支持 Function Call 就优先用 FC，不支持才退化为 CoT/ReAct。

#### 5. 三层保险的退出机制

FC 和 CoT 的主循环退出机制都有三层保险：

```python
# 第一层：正常退出
# FC: LLM 不返回 tool_calls → function_call_state = False → 退出
# CoT: LLM 输出 "Final Answer" → 退出

# 第二层：强制退出
if iteration_step == max_iteration_steps:
    prompt_messages_tools = []  # 清空工具列表，LLM 被迫直接回答

# 第三层：异常兜底
if iteration_step == max_iteration_steps and tool_calls:
    raise AgentMaxIterationError(...)  # 最后一轮还想调工具，抛异常
```

我的 Reflection Loop 只有一个 `max_rounds = 2` 的硬限制，没有"清空工具强制回答"这种优雅的降级策略。

### 跟我的 LangGraph Agent 对比

| 维度   | Dify Agent                   | 我的 LangGraph Agent   |
| ---- | ---------------------------- | -------------------- |
| 图引擎  | graphon（线程池 + ReadyQueue 调度） | LangGraph（支持并行但需声明）  |
| 中间件  | Layer 洋葱模型                   | 无，需要自己包装             |
| 节点创建 | 工厂模式 + 依赖注入                  | 手动 add_node          |
| 策略切换 | 插件化，Protocol 接口              | 硬编码在 StateGraph      |
| 推理模式 | FC / CoT 可配置切换               | 固定 Reflection Loop   |
| 退出机制 | 三层保险                         | 单一 max_rounds        |
| 历史管理 | PostgreSQL 持久化，含工具调用记录       | state 里的 messages 列表 |
| 知识库  | 包装成工具，Agent 自己决定是否调用         | 无知识库集成               |

差距还是那个结论：**虽然在算法层面没那么差，但在工程层面差距明显**。我的 Reflection Loop（Writer↔Reviewer 互审）是一种 Dify 没有的 Agent 设计模式，但 Dify 在扩展性、容错性、可观测性上远比我考虑得周全。

### 学到的三个设计理念

**Plugin over Hardcode**。Agent 策略不应该硬编码，用接口（Protocol）定义契约，具体实现以插件形式加载。这样新增策略不用改核心代码。

**Layer 分离关注点**。执行限制、配额控制、调试日志这些横切关注点，不应该散落在每个节点里，而是用中间件统一处理。

**知识库是工具，不是固定管道**。Dify 把知识库检索包装成一个工具，让 Agent 自己决定"我需不需要查知识库"，而不是每次查询都固定走 RAG。这比我在聊天助手里硬性关联知识库灵活得多。

### 最后

Dify 源码拆解系列到这里就告一段落了。两篇文章覆盖了 RAG Pipeline 和 Workflow/Agent 两大核心模块。如果你也在学 Agent 开发，希望这些笔记能给你一些参考hh。

目前在找 AI Agent / LLM 应用方向的实习。有 Dify 源码级理解和 LangGraph 多智能体系统实战经验，开源项目 AgentFlow（github.com/iuyup/AgentFlow）。
