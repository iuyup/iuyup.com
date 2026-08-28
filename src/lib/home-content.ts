import type { ContentItem } from "@/lib/content";

export type HomeLocale = "zh-CN" | "en";

interface ProjectItem {
  title: string;
  desc: string;
  tag: string;
  color: string;
  href: string;
}

interface PostPreviewTranslation {
  title: string;
  summary: string;
}

export const projectsByLocale: Record<HomeLocale, ProjectItem[]> = {
  "zh-CN": [
    {
      title: "AgentFlow",
      desc: "基于 LangGraph StateGraph 的多智能体设计模式集合，涵盖 Supervisor、Hierarchical、Parallel、Debate 等 10+ 种架构范式。每个 Pattern 均提供完整可运行代码与架构图解，帮助开发者快速选型和落地 Multi-Agent 系统。",
      tag: "Project",
      color: "#B8C5C4",
      href: "https://github.com/iuyup/AgentFlow",
    },
    {
      title: "Auto-Tweet Agent",
      desc: "基于 LangGraph 的 7 节点自动化推文 Agent，实现 新闻抓取 → AI 摘要 → 风格改写 → 自动发推 全流程。涵盖条件路由、人机协作节点与异常兜底机制，是 AgentFlow Supervisor 模式的真实应用案例。",
      tag: "Project",
      color: "#B8C5C4",
      href: "https://github.com/iuyup/News-Tweet-Agent",
    },
    {
      title: "RAG 2.0",
      desc: "企业级 RAG 检索增强系统，采用 FAISS 语义检索 + BM25 关键词检索的双路召回架构，通过 Reciprocal Rank Fusion (RRF) 融合排序，再经 BGE-Reranker 二阶段精排，显著提升检索准确率。支持多文档类型解析与分块策略配置。",
      tag: "Project",
      color: "#B8C5C4",
      href: "https://github.com/iuyup/Enterprise-Rag-Agent",
    },
  ],
  en: [
    {
      title: "AgentFlow",
      desc: "A collection of multi-agent design patterns built with LangGraph StateGraph, covering more than ten architectures including Supervisor, Hierarchical, Parallel, and Debate. Each pattern includes runnable code and architecture diagrams.",
      tag: "Project",
      color: "#B8C5C4",
      href: "https://github.com/iuyup/AgentFlow",
    },
    {
      title: "Auto-Tweet Agent",
      desc: "A seven-node LangGraph agent that automates news discovery, AI summarization, style rewriting, and publishing. It includes conditional routing, human-in-the-loop steps, and fallback handling.",
      tag: "Project",
      color: "#B8C5C4",
      href: "https://github.com/iuyup/News-Tweet-Agent",
    },
    {
      title: "RAG 2.0",
      desc: "An enterprise-grade RAG system combining FAISS semantic search with BM25 keyword retrieval, fused through reciprocal rank fusion and refined with BGE-Reranker. It supports multiple document formats and configurable chunking.",
      tag: "Project",
      color: "#B8C5C4",
      href: "https://github.com/iuyup/Enterprise-Rag-Agent",
    },
  ],
};

const englishPostPreviews: Record<string, PostPreviewTranslation> = {
  "从一个_while_循环开始_我做了一个会先问你的_MiniCode": {
    title: "Starting with a while Loop: I Built a MiniCode That Asks Before It Acts",
    summary:
      "MiniCode is a lightweight coding agent shaped by studying Pi and learning from real failures. It can read code, propose patches, run checks, and pause for approval before plans, writes, and commands in guided mode.",
  },
  "跑了一遍_Pi_之后_我才弄清_Coding_Agent_是怎么工作的": {
    title: "After Running Pi, I Finally Understood How Coding Agents Work",
    summary:
      "From the agent loop and tool adapters to extensions, sessions, and concurrency, I went beyond reading the code and built path protection and audit extensions of my own.",
  },
  "从一张背景图开始_最近给selfweb补的几块地基": {
    title: "Starting with a Background Image: The Foundations I Added to selfweb",
    summary:
      "From homepage loading and a unified journal to Sanity publishing and cache refreshes, this update strengthened the small systems that keep a personal website maintainable over time.",
  },
  "拆完_Dify_RAG_源码后_我把Agent模块扒了一遍": {
    title: "Inside Dify's Source Code 02: Agent Runtime",
    summary:
      "A layer-by-layer look at Dify's three-part agent architecture, from graphon and the workflow glue layer to the legacy agent runtime, compared with a custom LangGraph system.",
  },
  "花两天拆了_Dify_RAG_源码_跟自己的RAG对比后_才知道差距在哪": {
    title: "Inside Dify's Source Code 01: RAG Pipeline",
    summary:
      "After two days inside Dify's RAG pipeline, I found that the gap between a production system and a practice project lies less in algorithms than in engineering details such as parent-child chunks, concurrent retrieval, and fast failure.",
  },
  "GenericAgent_知乎版": {
    title: "3,000 Lines, 9 Tools: Reading the Entire GenericAgent Codebase",
    summary:
      "Nine atomic tools, a four-layer memory architecture, and working-memory injection: how a 3,000-line agent controls the whole system with roughly one-third of the token budget.",
  },
  从神经网络到Transformer: {
    title: "From Neural Networks to Transformers",
    summary:
      "AI chat is, at its core, an intense exercise in predicting the next word. This article starts with handwritten-digit recognition and works through vectors, attention, temperature, and Transformers.",
  },
  实习开发pvz小游戏遇到的一些问题: {
    title: "Small Problems I Hit While Building a PvZ Clone During My Internship",
    summary:
      "A record of several small but easy-to-miss Pygame PvZ problems: opening timing, cone and bucket accessories, pea targeting, and zombie blocking rules.",
  },
  Claude_Managed_Agents深度解读: {
    title: "A Deep Dive into Claude Managed Agents",
    summary:
      "A practical look at Anthropic's managed agent platform, from architecture to implementation, and how the developer's competitive edge changes when infrastructure becomes a platform concern.",
  },
  "openhuman-zhihu-juejin": {
    title: "Inside OpenHuman: The Memory Architecture of a Personal AI",
    summary:
      "A three-level summary tree as an alternative to full-database RAG search, including the layered design, comparisons with Mem0 and MemGPT, and lessons from two merged contributions.",
  },
};

export function localizeHomePosts(posts: ContentItem[], locale: HomeLocale): ContentItem[] {
  if (locale === "zh-CN") {
    return posts;
  }

  return posts.map((post) => {
    const translation = englishPostPreviews[post.slug];

    return {
      ...post,
      title: translation?.title ?? "English Edition Coming Soon",
      summary: translation?.summary ?? "This article is currently available in Chinese.",
    };
  });
}
