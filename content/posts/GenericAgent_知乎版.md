---
title: 3K 行代码，9 个工具，我读完了 GenericAgent 全部源码
date: 2026-05-11
summary: 9 个原子工具、四层记忆架构、Working Memory 注入，3K 行代码如何用 1/3 token 预算实现全系统控制。
image: /picture/preview.png
tags:
  - GenericAgent
  - Agent
---

# 3K 行代码，9 个工具，我读完了 GenericAgent 全部源码

最近 V2EX 有个帖子火了——有人说高强度用了半年 Claude Code 之后卸载了，转投一个叫 GenericAgent 的项目。200 多条回复，吵得不可开交。

我是 AgentFlow（一个多 Agent 设计模式开源项目）的作者。看到这种言论第一反应当然是"吹的吧"，但帖主给了论文数据，有 arXiv 技术报告，复旦团队做的。于是我花了两天时间，把 GA 的 3K 行核心源码从头到尾读了一遍，又亲手跑了几个任务。

读完之后我的感受是：**GA 的厉害不在于它做了什么，而在于它没做什么。**

---

## 它到底有多"简"

GA 的核心就是一个 while 循环不断调 LLM。没有 LangGraph，没有 DAG，没有 class 继承链，没有向量数据库。核心文件只有两个：`ga.py`（585 行）和 `agent_loop.py`（125 行），加起来 710 行就是整个系统的灵魂。

整个系统只有 9 个工具：code_run、file_read、file_write、file_patch、web_scan、web_execute_js、update_working_checkpoint、ask_user、start_long_term_update。

没有 `web_search` 工具——搜索是通过 `web_execute_js` 打开 Google 完成的。没有 `send_telegram`——发消息是通过 `code_run` 调 Telegram Bot API 完成的。

这不是偷工减料。这是一个深思熟虑的架构选择——**元工具 vs 专用工具**。工具越少，tool schema 占用的 context 越少，LLM 选择工具时的决策空间越小，出错率越低。论文数据显示，这种设计在长程任务上能用 1/3 的 token 预算达到同等甚至更好的效果。

当然代价也存在：它把工具选择的复杂度转移到了代码生成的复杂度上。Claude Code 调 `web_search` 只需要传一个 query，GA 要让 LLM 生成一段完整的 JS 去操作搜索引擎。本质上 GA 是在赌：**强模型 + 少 token > 弱模型 + 多 token。** 在 Sonnet / DeepSeek-V3 这个级别下，这个赌注是成立的。

## 四层记忆，才是真正的精华

如果说工具设计是"术"，那记忆架构就是"道"。GA 的记忆分四层：

**L1（30 行索引，常驻 system prompt）**——Agent 每一轮都能看到自己全部能力的目录，但只占 30 行。需要细节时再去读 L2/L3。这就是操作系统内存分页的思想——热数据常驻，冷数据按需加载。

**L2（环境事实库）**——路径、配置、凭证这类全局信息。

**L3（任务级 SOP 和脚本）**——被坑过的经验、关键步骤、可复用的工具脚本。这就是所谓的 Skill Tree——用几周后你的 memory 目录会积累起一棵独一无二的技能树。

**L4（历史会话原始记录）**——几乎不直接读取，用于归档。

最让我印象深刻的是它的记忆写入公理：**No Execution, No Memory.（无行动，不记忆）** 只有工具调用成功验证的信息才能写入。猜测、推理、未执行的计划一律禁止。

我自己做的 Agent Memory System 用的是 Mem0 风格——从对话中自动提取信息。这种方式方便但容易把 LLM 的幻觉也写进去。GA 的做法更安全：没亲手验证的信息不配进入记忆。

还有一个关键区别：传统 Agent 记忆是 **user-centric** 的——记住用户偏好和历史。GA 是 **task-centric** 的——只关心"这个任务怎么做更高效"。对于效率工具定位来说，这个选择很准确。

## Working Memory 注入——为什么第 50 轮还能记住第 1 轮的事

Claude Code 在长任务中容易"忘事"是很多用户的痛点。GA 的解决方案简单但有效：每一轮工具调用结束后，强制注入一段结构化的「工作记忆」到下一轮的 user message 里。包括压缩过的历史摘要和 Agent 自己设置的关键信息。LLM 不需要自己记住上下文——每轮都会被"提醒"一遍。

再加上每 7 轮强制提醒切换策略、每 10 轮重新注入全局记忆、每 10 轮重置工具描述防止 context 膨胀。这些工程细节不性感，但对长程稳定性至关重要。

另外上下文压缩也做了两层：LLM 历史压缩每 5 轮触发一次，把早期消息中的 thinking/tool_result 截断到 800 字符；HTML 压缩引擎（873 行的 simphtml.py）先在浏览器端做 DOM 裁剪再在 Python 端做 token 级截断。这就是为什么 GA 浏览器操作只用 1/5 预算——其他 Agent 把整个 HTML 塞给 LLM，GA 只给精简后的主体内容。

## 实测：用 9 个工具现场"发明" Telegram 集成

跑了三个任务，最震撼的是第三个。

我发了一句：「帮我发一条消息到我的 Telegram，内容是 Hello from GenericAgent」。

它的反应：先用 `ask_user` 问我要 Bot Token。我给了 Token，**没给 Chat ID**。它自己用 `code_run` 调了 Telegram Bot API 的 `getUpdates` 获取到 Chat ID，然后 `sendMessage` 发出去，手机收到了。

整个"Telegram 集成"是它用基础工具现场组合出来的，根本不需要预置这个功能。Claude Code 做同样的事得装 MCP Server 或者手写脚本。

另一个有意思的测试是让它查 GitHub star 数。它先尝试浏览器、失败后查 L3 记忆找方案、SOP 也解决不了、最终 fallback 到 `code_run` 用 PowerShell 调 GitHub API。8 个 turn 完整展示了失败升级策略——同一个"元工具"既能写文件也能当 HTTP 客户端。

## 不好的地方

公平起见：前端是毛坯房，开发者原话"不改"，当然我们可以根据自己的需求自己写一个前端。安全性粗放，系统级控制权 + LLM 幻觉有潜在风险，CC 有沙箱概念 GA 没有。依赖强模型，弱模型带不动元工具设计。生态不如 CC，学术团队 vs 商业产品的长期维护确定性不同。

## 我最大的收获

读完 GA 源码后认知升级最大的一点：**极简不是偷懒，是设计选择。**

我做 AgentFlow 的时候，总想着用更多 Pattern、更复杂的架构去覆盖更多场景。GA 告诉我，一个 while 循环 + 9 个工具 + 好的 prompt engineering，就能干大多数 Agent 框架做的事。3K 行代码，任何人两小时就能读完。

几个对 Agent 开发者的具体启示：工具数量不是越多越好；记忆系统需要一个常驻的极简索引层；从对话提取记忆不如只记工具验证成功的信息；长程任务必须靠 Working Memory 注入而非指望 LLM 自己记住上下文。

推荐去读一遍 ga.py 和 agent_loop.py，710 行，收获比读很多论文都大。

项目地址：github.com/lsdefine/GenericAgent
技术报告：arxiv.org/abs/2604.17091
源码拆解掘金全文（含完整代码分析）：juejin.cn/spost/7637740418106736646
