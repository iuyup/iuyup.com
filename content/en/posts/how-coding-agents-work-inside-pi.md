---
title: I Didn't Understand How Coding Agents Work Until I Ran Pi
date: 2026-07-29
summary: From the agent loop and tool adaptation to extension policies, sessions, and concurrency. I went beyond reading the code and built path-protection and audit extensions myself; a missing audit result ended up revealing Pi's event boundaries with surprising clarity.
image: /picture/pi.png
tags:
  - Pi
  - Coding Agents
  - AI Agents
sourceSlug: 跑了一遍_Pi_之后_我才弄清_Coding_Agent_是怎么工作的
---

> For some time, I had wanted to break a Coding Agent down into pieces small enough to understand: at exactly which layer does the model decide to call a tool, how does a tool result return to the next turn of the conversation, and where does so-called “permission control” actually intervene? Pi is well suited to this kind of investigation. Instead of hiding every capability behind a black-box command, it lays out the agent loop, tools, extensions, and sessions in the repository. In the end, I went beyond reading the source and wrote both a path-protection extension and an audit extension for it. What truly helped me understand Pi was not my first pass through the code, but an audit log that came up one record short.

### A Coding Agent Is Actually Quite Simple

When I first started looking at Pi, I thought the important parts would be the prompt, model selection, or some complex planner. It was only after following `agent-loop.ts` downward that I realized how plain its skeleton really is: the model first returns an assistant message; if that message contains a tool call, the loop finds the corresponding tool, processes and validates the arguments, and executes it; the tool result is then added back to the context as a `toolResult` message before the model is asked to continue.

It looks roughly like this:

```text
LLM returns a tool call
  -> find the tool definition
  -> process and validate arguments
  -> policy check
  -> execute the tool
  -> write the tool result back to the message context
  -> next LLM turn
```

The last step is the one I care about most in this chain. A tool is not finished simply because it has finished running in the terminal; its result has to become a message the model can understand. Otherwise, the model has no idea whether a file was written successfully or whether a command failed, and it cannot decide what to do next. Pi normalizes these results as `toolResult`, so actions that look completely different—reading a file, writing a file, and running a command—are all the same kind of “observation” from the model's perspective in the next turn.

This is also the part I most wanted to preserve when I later built a mini agent: get one complete loop working first, then talk about planning, multiple agents, or flashy UIs. Without reliable result feedback, an Agent is just a chat box that knows how to call tools.

### Tool Definitions and Runtime Tools Are Separated by a Layer

In Pi's Coding Agent, neither built-in tools nor extension tools are inserted directly into the loop. `tool-definition-wrapper.ts` wraps a complete `ToolDefinition` into the `AgentTool` that the agent runtime actually uses.

The former contains the description shown to the model, the parameter schema, the execution function, and the terminal rendering behavior; the latter retains only the name, arguments, and `execute` function needed by the loop. The extension context is injected at execution time.

At first, I thought this wrapping layer was unnecessarily indirect. Later, I came to see it as essential. The model does not need to know how the terminal highlights a diff, and the loop should not need to know every detail of the extension API. Once “what the model sees,” “how the loop schedules work,” and “how the UI presents it” are separated, the same tool can be reused by the CLI, the SDK, or another interface.

Pi's extension registration follows this same boundary. After an extension calls `pi.registerTool`, the tool table is refreshed; if its name matches that of a built-in tool, the extension tool overrides the built-in one. This design is flexible, but it also means a tool name is not just an arbitrary string. It is an interface capable of changing runtime behavior.

### I Didn't Just Read the Permission Code—I Made It Block Something for Real

When reading the `tool_call` event, it is easy enough to understand that “a policy check can happen here.” I still wanted to know what that looked like during a real model call, so I wrote a small `protected-paths` extension:

- `write` and `edit` could not write outside the workspace;
- `.env`, `.env.*`, `.git`, and `node_modules` were protected;
- other tools were not given restrictions that pretended to be comprehensive.

I then asked Pi directly to try writing `.env` with the `write` tool. The model did issue the write, but the tool result became `Write target is protected`, and no `.env` file appeared in the workspace. When I changed the target to the ordinary file `playground/policy-allowed.txt`, the write succeeded.

This experiment clarified a boundary that is very easy to blur: this is an Agent policy layer, not an operating-system sandbox. It can reject an action before a tool call is executed, but it cannot automatically address lower-level issues involving `bash`, symbolic links, or process permissions. Calling a few `if` statements in an extension a “security sandbox” would only make me lower my guard.

### I Only Saw the Real Event Boundary When the Audit Failed the First Time

To record this policy decision, I added a `tool-audit` extension as well. It appends tool calls to JSONL, recording the tool name, path, argument field names, the length of written content, and result statistics—but not the raw text of `write.content` or `bash.command`.

I initially listened for `tool_call` and `tool_result`, expecting to get a pair of records:

```text
tool_call -> tool_result(error)
```

After the actual run, however, the log contained only `tool_call`. The `.env` file had indeed not been written, and the model had indeed received the blocking error; only the result event I expected was missing.

This was more valuable than getting the code right on the first attempt. I returned to `agent-loop.ts` and found that when `beforeToolCall` returns `block`, Pi immediately constructs an error result—what it internally calls an immediate outcome. The call never enters actual tool execution or `afterToolCall`; meanwhile, the Coding Agent extension's `tool_result` event is bridged from the latter. For policy blocks, then, `tool_result` is not a complete terminal event.

The loop still emits `tool_execution_end`. After changing the audit extension to listen for that event, the second test finally produced two records with the same `toolCallId`:

```text
tool_call -> tool_finalized(error)
```

At the same time, the audit file did not contain the original text I had asked the model to write, only its `contentLength`. This small detour gave me a more concrete understanding of “observability”: adding a log file is not the end of the job. First, you have to define exactly which part of the lifecycle each event covers. Even an event named result may omit results produced by policy rejection.

### A Session Is Not a Chat Log, and Auditing Should Not Look Only at Context

Pi's SessionManager stores a message tree in JSONL, linked through `parentId` and `leafId`. Branching does not copy the entire conversation; it moves the current leaf onto another path. When compacting context, Pi does not simply delete old records either. It writes a summary and retains the tail messages so that subsequent model calls consume fewer tokens.

This helped me separate two things I had previously found easy to conflate: model context needs to get shorter, but audit history must not disappear as a result. The model only needs a sufficient summary and the latest state to keep working; but if a write fails or a policy is bypassed, a later investigation still needs to trace the original tool call and determine what happened.

Pi keeps these two tracks separate. It does not promise to handle every governance concern for me, but at least it does not treat “history fed to the model” and “operational facts that should be retained” as the same kind of data.

### Concurrency Is Not a Switch, but a Resource Problem

The last thing that changed my mind was multiple tool calls.

In parallel mode, Pi still performs tool lookup, argument validation, and policy checks in the model's call order; only the tools that pass those checks execute concurrently. At runtime, `tool_execution_end` events appear in the order the tools finish, but the tool results ultimately written back to the model context return to the model's original call order.

These two orderings may look a little awkward, but they serve different goals: an audit wants to show the real sequence of events, while the model needs stable context aligned with the order of its own calls.

I had also assumed that Pi would simply make every `write` and `edit` operation sequential. Instead, it is more precise. Both tools pass through `file-mutation-queue`: modifications to the same real path are queued, while operations on different files can still run concurrently. In other words, it does not vaguely declare that “writes are dangerous, so do not run them concurrently.” It constrains contention to the same resource.

This also reminded me that there is no need for the first version of a mini agent to rush into reproducing this optimization. Making every side-effecting tool sequential at first makes it possible to get policy, approval, and auditing right; once a real need for concurrency appears, locks can be introduced based on file paths or other resources. What Pi's code gave me here was not something to “copy immediately,” but a very clear order of evolution.

### How Is Pi Different from Other Coding Agents?

After reading it, I no longer wanted to rank Pi simplistically as “stronger than Claude Code” or “weaker than Aider.” They occupy different positions.

Claude Code feels more like a polished workbench: its permission prompts, terminal interaction, project understanding, and everyday development workflow are more complete. Aider is highly focused on code editing, repository context, and Git workflows. What attracts me to Pi is that it exposes the parts underneath the workbench: how tools enter the loop, how extensions intercept calls, how sessions are persisted, and how concurrency avoids different operations overwriting the same file.

The tradeoff is equally direct. If I use Pi to build my own Agent, I have to define the policies, approvals, audit format, and permission boundaries myself. It provides composable parts, not an enterprise governance system that handles everything on my behalf. For everyday coding, I would not necessarily give up a mature product just because Pi is “good for learning.” But for understanding Coding Agents and building a small project whose design tradeoffs I can explain clearly in a job interview, Pi is an excellent reference implementation.

### Closing Thoughts

Reading Pi did not lead me to a universal Agent architecture. Instead, a few concrete details stayed with me: tool results must return to the model context; policy interception and tool execution are two different lifecycles; audits must cover rejection paths; and concurrency ultimately comes down to whether operations contend for the same resource.

All of these ideas look lightweight on an introduction page. It was only after running the system, seeing an audit record go missing, and tracing it back through the call chain that they became my own understanding. Next, I will take these boundaries with me as I build a mini coding agent, instead of starting with an empty `while` loop and guessing what it should look like.

---

*Author: T | Shantou University, Optoelectronic Information Science and Engineering | AI Agent Focus*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
