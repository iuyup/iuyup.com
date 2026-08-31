---
title: I Started with a while Loop and Built MiniCode—an Agent That Asks First
date: 2026-08-28
summary: MiniCode is a lightweight coding agent I built from Pi's source code and several real-world lessons. It can read code, propose patches, and run checks, while guided mode pauses for human confirmation before planning, writing, or executing commands.
image: /picture/minicode.png
sourceSlug: 从一个_while_循环开始_我做了一个会先问你的_MiniCode
tags:
  - MiniCode
  - Coding Agent
  - TypeScript
  - Open Source
---

> When I wrote my first “Notes” post at the end of July, I left one line at the end: over the next few months, I wanted to build a mini coding agent. At the time, it was only a direction. I first went to read Pi and understand its Agent Loop, tools, and events, then actually started writing from a while loop. A month later, MiniCode finally went from “a demo that runs” to a small tool I was willing to put out for other people to see.

### Why Build Another Coding Agent?

There are already plenty of agents that can write code. Claude Code, Codex, and Aider are all far more complete than MiniCode, so from the beginning I never intended to build a replacement with more features.

What I really wanted to understand was this: after I hand the model a request like “help me fix this issue,” what exactly happens in between? How does the model find the file? How do tool results return to the next round of conversation? Who confirms a change before it is made? And how should the process come to a close after a test fails?

Mature products usually wrap these things very well, which makes them smooth to use. But precisely because they are so smooth, it is easy for me to see only the final diff. After reading Pi's source code, I realized that the innermost skeleton of a coding agent is not as complicated as I had imagined:

```text
The model requests a tool
  -> look up and validate the tool locally
  -> execute the tool
  -> write the result back into the model context
  -> let the model continue to the next round
```

The core really can be written as a while loop. What is genuinely difficult is everything around that loop: what the model can see, what it can do, whether failures have terminal states, and whether the action the user confirms is actually the one that is ultimately executed.

That is where MiniCode began.

### The First Version Was Clumsy, but Every Step Was Visible

The earliest version of MiniCode did not even connect to a real model. I first wrote a deterministic `FakeModel` and only let it search, read source code, and return results. It did not understand open-ended tasks, and it would not pretend that it had really fixed the code.

This version looked a little clumsy, but it was well suited to validating the Agent Loop. The model issued a tool request, the local registry found the tool, the arguments were validated and executed, and the result became a `ToolResultMessage` in the message history. Unknown tools, invalid arguments, and policy rejections could not quietly disappear either; each had to leave behind a complete error result.

Later, I added a very small Working Ledger that records only facts verified by tools during the current task. The model saying “the file has been modified” does not count; the patch has to be written successfully. The model saying “the tests should pass” does not count either; the test process has to return successfully.

Only after this minimal path worked end to end did I connect DeepSeek and a generic OpenAI-compatible Profile. The default model remains the offline `FakeModel`; model requests go online only when a remote Profile is explicitly selected. The Profile does not store the API key either. It only records which environment variable to read it from.

### Why It Keeps Stopping to Ask Me

Under `--guided --mode edit`, MiniCode's most complete path currently looks roughly like this:

```text
User task
  -> generate a plan and wait for CONTINUE
  -> search and read the code
  -> show the patch and wait for APPLY
  -> show the test command, directory, and risks, then wait for RUN
  -> confirm a repair direction when necessary
  -> inspect Git status / diff in read-only mode
  -> provide the final answer
```

`CONTINUE`, `APPLY`, `RUN`, and `CANCEL` are local control words and are not sent to the model as ordinary messages. Entering one of them when its corresponding confirmation panel is not present has no side effects either.

At first I also wondered whether this was too much confirmation and would make the tool feel slow. After I actually connected editing, commands, and failure recovery, however, these pauses felt important. Plan confirmation answers “what are we preparing to do?” Patch confirmation answers “what are we preparing to write?” Command confirmation answers “what are we preparing to run?” They are not the same decision, and one approval at the beginning cannot cover all of them.

Code changes make this especially clear. MiniCode requires the model to successfully read the target file first, then propose one unique and exact text replacement. After the full patch is displayed, the file is written only when the user enters `APPLY`. A successful write still cannot be declared complete immediately: the next round is forced into a real `test`. If the test has not actually run and passed, the task cannot be recorded as successful.

This flow is not as satisfying as “fully automatic,” but at least it lets me know where the agent has stopped and what will happen when I approve the next step.

### The Hard Part Was Not Getting It to Change Files

It is not difficult to get a model to generate new code. The difficult part is preventing that capability from casually crossing its boundaries.

MiniCode's file tools accept only workspace-relative paths. After resolving the real path, they also verify that it has not escaped the workspace. `.git`, `.env*`, and common credential and key files are rejected outright, and a project can use `.minicodeignore` to narrow the agent's readable scope further. The file and its parent directory are checked again before and after patch confirmation so that the user cannot be shown one file while a different file has taken its place by the time the write occurs.

Commands are not exposed as raw shell strings. At present, MiniCode accepts only separated `program + args + cwd` values, and the first version permits only a controlled subset of Node/npm commands. Git exposes just three fixed, read-only actions—`status`, `diff`, and `staged_diff`—and will not stage, commit, or push for me. A promise in the prompt that “I will perform only safe operations” does not automatically grant access through these entry points.

By this point, the phrase “prompts are not a permission system” had become much more concrete to me. The model can be responsible for proposing an action, but it should not decide whether it has permission to perform that action. The real boundaries have to remain in local code, tool registration, and the state machine.

### Eventually, It Started to Feel Like a Tool

After the runtime worked, I spent quite a bit more time on the TUI.

MiniCode uses Pi's terminal UI components, but it does not copy Pi's full interface. The top keeps only the model, permissions, and workspace; the conversation sits in the middle; and the bottom shows the current path and Profile. Tool details are collapsed by default and can be expanded with `Ctrl+O` or `/details` when needed. A remote model's final answer streams onto the screen, but if that round later turns into a tool call, fails evidence validation, or is canceled by the user, the temporary text is withdrawn instead of leaving behind a half-finished answer that looks final.

I still prefer the terminal. A coding agent already works around repositories, files, and commands. If I immediately wrapped it in a web page just to make it “feel like a product,” I would instead spend my effort on authentication, deployment, and page state. This TUI is not flashy, but the task, confirmation waits, current execution, and final resolution are all clear, and it preserves the terminal's native scrollback history.

The default `FakeModel` can demonstrate a fixed offline flow and some confirmation steps, but it does not understand open-ended tasks and will not modify code on its own. To let a real model read or change a project, a Profile must be configured explicitly and the corresponding mode enabled.

### I Did Not Want One Demo to Be the Only Proof That It Worked

As the project grew, the test count gradually reached 287. In addition to the Agent Loop and the tools themselves, I tested path traversal, symbolic links, files being replaced during confirmation, command arguments, Git's read-only boundary, terminal control characters, audit redaction, and state flows such as “a real test must run after a patch succeeds.” At the time of writing, the [latest CI run](https://github.com/iuyup/minicode/actions/runs/33139986474) has passed on both Windows and Ubuntu.

I also ran a fixed evaluation with DeepSeek V4 Flash: 15 tasks, 3 configurations, and 3 repetitions per configuration, for 135 runs in total. The streamlined three-tool MiniCode configuration achieved an 88.9% pass rate, while the full product configuration managed only 66.7%. My first reaction was: how did doing more make it perform worse?

The result is a little awkward, but I think it is more useful than showing only a successful GIF. It demonstrates that a more complete planning, validation, and repair state machine does not automatically produce a higher task success rate. There is still plenty to tune in the prompts, budgets, and failure-recovery flow. On the other hand, the safety tasks in the fixed matrix scored 45/45, with no secret leakage and no unauthorized tool succeeding. But that result represents only this set of tasks and this model configuration.

At least now I can break down where it works and where it still falls short using data instead of drawing conclusions from one unusually smooth demo.

### What It Is Still Not

MiniCode currently has no general-purpose shell, no Git write operations, no browser, no multi-agent system, and no remote sandbox. It will not automatically commit changes or open a pull request for me. A real model can still misunderstand a task, waste its tool budget, or fail to converge in time within a strict flow.

It is not an operating-system sandbox either. An npm project script that the user approves can still read files available to the host process, access the network, or start other processes. More precisely, MiniCode is a small project that lays a coding agent's actions, authorization, and evidence out in the open: there is not much code, the execution path can be followed, it pauses before important side effects, and failures return to concrete terminal states.

Next, I want to improve the task success rate of the full product configuration and refine the experience in a real terminal before considering more capabilities. It is easy to keep adding tools. The hard part is being able to explain, for every new tool, why it exists, who can approve it, and what it leaves behind after a failure.

### Finally

A month ago, I only wanted to prove that I could write an Agent Loop. Looking back now, I care less about the while loop itself than four very concrete things: the model cannot expand its own permissions; user confirmation must be bound to the object that is actually executed; tool rejections and failures must also reach terminal states; and every code change must leave behind evidence of validation.

MiniCode is certainly not finished, but it is no longer just an idea at the end of my first Notes post.

If you want to run it yourself, you will need Node.js 22.18 or later:

```bash
git clone https://github.com/iuyup/minicode.git
cd minicode
npm install
npm run mini
```

Project: [github.com/iuyup/minicode](https://github.com/iuyup/minicode)

---

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agents*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
