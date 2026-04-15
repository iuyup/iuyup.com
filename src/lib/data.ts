export const projects = [
  {
    title: 'AgentFlow',
    desc: '基于 LangGraph StateGraph 的多智能体设计模式集合，涵盖 Supervisor、Hierarchical、Parallel、Debate 等 10+ 种架构范式。每个 Pattern 均提供完整可运行代码与架构图解，帮助开发者快速选型和落地 Multi-Agent 系统。',
    tag: 'Project',
    color: '#B8C5C4',
    href: 'https://github.com/iuyup/AgentFlow',
  },
  {
    title: 'Auto-Tweet Agent',
    desc: '基于 LangGraph 的 7 节点自动化推文 Agent，实现 新闻抓取 → AI 摘要 → 风格改写 → 自动发推 全流程。涵盖条件路由、人机协作节点与异常兜底机制，是 AgentFlow Supervisor 模式的真实应用案例。',
    tag: 'Project',
    color: '#B8C5C4',
    href: 'https://github.com/iuyup/News-Tweet-Agent',
  },
  {
    title: 'RAG 2.0',
    desc: '企业级 RAG 检索增强系统，采用 FAISS 语义检索 + BM25 关键词检索的双路召回架构，通过 Reciprocal Rank Fusion (RRF) 融合排序，再经 BGE-Reranker 二阶段精排，显著提升检索准确率。支持多文档类型解析与分块策略配置。',
    tag: 'Project',
    color: '#B8C5C4',
    href: 'https://github.com/iuyup/Enterprise-Rag-Agent',
  },
];

export const albums = [
  { cover: '/albums/more-life.jpg', url: 'https://music.apple.com/cn/album/more-life/1440890708', name: 'More Life', artist: 'Drake' },
  { cover: '/albums/blond.jpg', url: 'https://music.apple.com/cn/album/blonde/1146195596', name: 'Blonde', artist: 'Frank Ocean' },
  { cover: '/albums/sos.jpg', url: 'https://music.apple.com/cn/album/sos/1657869377', name: 'SOS', artist: 'SZA' },
  { cover: '/albums/never-enough.jpg', url: 'https://music.apple.com/cn/album/never-enough-bonus-version/1681322859', name: 'Never Enough', artist: 'Daniel Caesar' },
];
