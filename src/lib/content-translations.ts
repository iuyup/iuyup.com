export type TranslatedCollection = "posts" | "notes";

interface TranslationPair {
  sourceSlug: string;
  englishSlug: string;
}

export const postTranslationPairs: TranslationPair[] = [
  {
    sourceSlug: "从一个_while_循环开始_我做了一个会先问你的_MiniCode",
    englishSlug: "building-minicode-that-asks-first",
  },
  {
    sourceSlug: "跑了一遍_Pi_之后_我才弄清_Coding_Agent_是怎么工作的",
    englishSlug: "how-coding-agents-work-inside-pi",
  },
  {
    sourceSlug: "从一张背景图开始_最近给selfweb补的几块地基",
    englishSlug: "foundations-behind-selfweb",
  },
  {
    sourceSlug: "花两天拆了_Dify_RAG_源码_跟自己的RAG对比后_才知道差距在哪",
    englishSlug: "dify-rag-pipeline-source-walkthrough",
  },
  {
    sourceSlug: "拆完_Dify_RAG_源码后_我把Agent模块扒了一遍",
    englishSlug: "dify-agent-runtime-source-walkthrough",
  },
  {
    sourceSlug: "GenericAgent_知乎版",
    englishSlug: "genericagent-source-code-walkthrough",
  },
  {
    sourceSlug: "从神经网络到Transformer",
    englishSlug: "from-neural-networks-to-transformers",
  },
  {
    sourceSlug: "实习开发pvz小游戏遇到的一些问题",
    englishSlug: "lessons-from-building-a-pvz-clone",
  },
  {
    sourceSlug: "Claude_Managed_Agents深度解读",
    englishSlug: "claude-managed-agents-deep-dive",
  },
  {
    sourceSlug: "openhuman-zhihu-juejin",
    englishSlug: "openhuman-memory-architecture",
  },
];

export const noteTranslationPairs: TranslationPair[] = [
  { sourceSlug: "七夕有感", englishSlug: "qixi-alone-with-gpt" },
  { sourceSlug: "如何超过大多数人", englishSlug: "how-to-get-ahead-of-most-people" },
  { sourceSlug: "阅读笔记", englishSlug: "reading-notes-rich-dad-poor-dad" },
  { sourceSlug: "黑客松初步", englishSlug: "my-first-look-at-hackathons" },
  { sourceSlug: "租房经验", englishSlug: "lessons-from-renting-in-shenzhen" },
  { sourceSlug: "认识新朋友", englishSlug: "meeting-new-people" },
  { sourceSlug: "第一篇随心", englishSlug: "my-first-field-note" },
];

function pairsFor(collection: TranslatedCollection) {
  return collection === "posts" ? postTranslationPairs : noteTranslationPairs;
}

export function getEnglishSlug(collection: TranslatedCollection, sourceSlug: string) {
  return pairsFor(collection).find((pair) => pair.sourceSlug === sourceSlug)?.englishSlug;
}

export function getSourceSlug(collection: TranslatedCollection, englishSlug: string) {
  return pairsFor(collection).find((pair) => pair.englishSlug === englishSlug)?.sourceSlug;
}
