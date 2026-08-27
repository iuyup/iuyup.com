import { RSS_URL, SITE_URL } from "@/lib/site";

export interface SiteTimelineEntry {
  date: string;
  title: string;
  description: string;
}

export interface ExternalFeed {
  name: string;
  description: string;
  href: string;
}

export const siteProfile = {
  name: "iuyup",
  url: SITE_URL,
  feedPath: "/feed.xml",
  feedLabel: RSS_URL,
};

// Keep this list intentionally hand-curated. A feed should be added here only
// after it is a source the site owner actually wants to recommend.
export const externalFeeds: ExternalFeed[] = [];

export const siteTimeline: SiteTimelineEntry[] = [
  {
    date: "2026-07-30",
    title: "持续打磨阅读体验",
    description: "调整阅读进度和评论细节，让长文阅读与互动更顺畅。",
  },
  {
    date: "2026-07-27",
    title: "接入 Sanity 内容管理",
    description: "为文章和随心补上迁移、缓存与预览日期处理，发布开始面向 CMS。",
  },
  {
    date: "2026-07-22",
    title: "随心栏目上线",
    description: "文章与随心开始共享索引、详情、RSS 和站点地图，给片段和临时记录留出位置。",
  },
  {
    date: "2026-07-22",
    title: "优化 Monet 首页背景",
    description: "保留绘画感的同时改用优化后的本地图片，降低首屏的图片负担。",
  },
  {
    date: "2026-07-20",
    title: "统一文章页面样式",
    description: "重做文章列表、详情和阅读工具栏，让阅读体验回到同一套页面语言里。",
  },
  {
    date: "2026-07-17",
    title: "接入 Go 服务",
    description: "新增 Go API，并逐步接手聊天、留言和文章 RAG 等动态能力。",
  },
  {
    date: "2026-04-17",
    title: "完善站点能力",
    description: "补齐 RSS、robots、站点地图和分享图，并为留言接入 Redis。",
  },
  {
    date: "2026-04-12",
    title: "组件化重构首页",
    description: "将导航、首屏、博客区与内容卡片拆为独立组件，主页结构开始稳定下来。",
  },
  {
    date: "2026-04-12",
    title: "确立主页视觉与内容入口",
    description: "加入 Monet 背景与文章 RAG，确定之后持续延展的视觉和内容方向。",
  },
  {
    date: "2026-04-11",
    title: "接入 AI 助手",
    description: "在站内加入首版 Chat Agent，让访客可以直接对话了解这个人和站点。",
  },
  {
    date: "2026-04-10",
    title: "项目建仓",
    description: "从 Next.js 初始工程出发，开始搭建这处个人站。",
  },
];
