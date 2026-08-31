---
title: "3K Lines, 9 Tools: I Read All of GenericAgent's Source Code"
date: 2026-05-11
summary: "Nine atomic tools, a four-layer memory architecture, and Working Memory injection: how 3K lines of code achieve full-system control with one-third of the token budget."
image: /picture/preview.png
tags:
  - GenericAgent
  - Agent
sourceSlug: "GenericAgent_知乎版"
---


A post recently went viral on V2EX. Someone said that after using Claude Code intensively for six months, they uninstalled it and switched to a project called GenericAgent. More than 200 replies followed, and the argument became heated.

I am the author of AgentFlow, an open-source project about multi-Agent design patterns. My first reaction to a claim like that was naturally, "That has to be hype." But the original poster provided data from a paper and linked an arXiv technical report produced by a team at Fudan University. So I spent two days reading all 3K lines of GA's core source code from beginning to end, then ran several tasks myself.

Afterward, my conclusion was: **GA's strength lies not in what it does, but in what it does not do.**

---

## How "Minimal" Is It, Exactly?

At its core, GA is just a while loop that calls an LLM repeatedly. There is no LangGraph, no DAG, no class inheritance chain, and no vector database. There are only two core files: `ga.py` at 585 lines and `agent_loop.py` at 125 lines. Together, those 710 lines are the soul of the whole system.

The entire system has only nine tools: code_run, file_read, file_write, file_patch, web_scan, web_execute_js, update_working_checkpoint, ask_user, and start_long_term_update.

There is no `web_search` tool—searching is done by opening Google through `web_execute_js`. There is no `send_telegram` tool—messages are sent by calling the Telegram Bot API through `code_run`.

This is not cutting corners. It is a deliberate architectural choice: **meta-tools versus specialized tools**. Fewer tools mean that tool schemas occupy less context, the LLM has a smaller decision space when choosing a tool, and the error rate is lower. Data in the paper shows that this design can achieve equal or better results on long-horizon tasks with one-third of the token budget.

There is, of course, a tradeoff: it transfers the complexity of tool selection into the complexity of code generation. Claude Code needs only a query to call `web_search`; GA has to make the LLM generate a complete piece of JavaScript to operate the search engine. At heart, GA is making a bet: **strong model + fewer tokens > weak model + more tokens.** At the Sonnet / DeepSeek-V3 level, that bet holds.

## Four Layers of Memory Are the Real Essence

If the tool design is the technique, the memory architecture is the underlying principle. GA divides memory into four layers:

**L1 (a 30-line index that remains in the system prompt)**—on every turn, the Agent can see a directory of all its capabilities, yet it occupies only 30 lines. It reads L2 or L3 only when details are needed. This follows the idea of operating-system memory paging: hot data stays resident, while cold data is loaded on demand.

**L2 (environment facts)**—global information such as paths, configuration, and credentials.

**L3 (task-level SOPs and scripts)**—lessons from past failures, critical steps, and reusable tool scripts. This is the so-called Skill Tree. After a few weeks of use, your memory directory will have accumulated a unique tree of skills.

**L4 (raw historical session records)**—almost never read directly and used for archiving.

What impressed me most was its axiom for writing memory: **No Execution, No Memory.** Only information verified by a successful tool call may be written. Guesses, reasoning, and unexecuted plans are all forbidden.

The Agent Memory System I built uses a Mem0-style approach that automatically extracts information from conversations. It is convenient, but it can also write the LLM's hallucinations into memory. GA's approach is safer: information that has not been personally verified does not deserve a place in memory.

There is another important distinction. Traditional Agent memory is **user-centric**—it remembers user preferences and history. GA is **task-centric**—it cares only about how to perform a task more efficiently. For a productivity tool, that is a very precise choice.

## Working Memory Injection—Why Turn 50 Still Remembers Turn 1

Claude Code's tendency to "forget things" during long tasks is a pain point for many users. GA's solution is simple but effective: after every tool call, it forcibly injects a structured block of "Working Memory" into the next user message. This includes a compressed history summary and key information set by the Agent itself. The LLM does not have to remember the context on its own—it is reminded on every turn.

On top of that, GA forces a strategy-switch reminder every seven turns, reinjects global memory every ten turns, and resets tool descriptions every ten turns to prevent context growth. These engineering details are not glamorous, but they are essential to long-horizon stability.

Context compression also has two layers. LLM history compression runs every five turns and truncates thinking/tool_result content in earlier messages to 800 characters. The HTML compression engine, the 873-line `simphtml.py`, first prunes the DOM in the browser and then performs token-level truncation in Python. This is why GA's browser operations use only one-fifth of the budget: other Agents feed the entire HTML document to the LLM, while GA provides only a streamlined version of the main content.

## Hands-On Test: "Inventing" a Telegram Integration with Nine Tools

I ran three tasks, and the third was the most striking.

I sent one sentence: "Send a message to my Telegram saying Hello from GenericAgent."

Its response was to ask me for a Bot Token through `ask_user`. I provided the Token but **did not provide a Chat ID**. It called the Telegram Bot API's `getUpdates` endpoint through `code_run`, obtained the Chat ID on its own, and then used `sendMessage` to send the message. It arrived on my phone.

It assembled this entire "Telegram integration" on the spot from basic tools, with no need for the feature to be built in beforehand. Claude Code would need an MCP Server or a manually written script to do the same thing.

Another interesting test was asking it to check a GitHub star count. It first tried the browser, then looked in L3 memory for a solution after that failed. When the SOP could not solve it either, it finally fell back to `code_run` and called the GitHub API through PowerShell. Across eight turns, it fully demonstrated its failure-escalation strategy—the same "meta-tool" could write files and also serve as an HTTP client.

## What Is Not So Good

To be fair, the frontend is unfinished. The developer's own position is that they "will not change it," although of course we can write a frontend to suit our own needs. Security is handled rather loosely, and system-level control combined with LLM hallucinations creates potential risk. Claude Code has a sandbox concept; GA does not. It depends on strong models, because weaker models cannot handle the meta-tool design. Its ecosystem is not as mature as Claude Code's, and an academic team and a commercial product offer different levels of certainty around long-term maintenance.

## My Biggest Takeaway

The biggest shift in my thinking after reading GA's source code was this: **minimalism is not laziness; it is a design choice.**

When I built AgentFlow, I was always trying to cover more scenarios with more Patterns and more complex architectures. GA showed me that a while loop, nine tools, and good prompt engineering can do what most Agent frameworks do. The codebase is only 3K lines, and anyone can read it in two hours.

There are several concrete lessons for Agent developers: more tools are not always better; a memory system needs a minimal index layer that stays resident; extracting memory from conversations is less reliable than storing only information verified by successful tool use; and long-horizon tasks must rely on Working Memory injection rather than expecting the LLM to remember context on its own.

I recommend reading `ga.py` and `agent_loop.py`. They are only 710 lines, and I learned more from them than from many papers.

Project: github.com/lsdefine/GenericAgent
Technical report: arxiv.org/abs/2604.17091
Full source walkthrough on Juejin, including complete code analysis: juejin.cn/spost/7637740418106736646

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agents*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
