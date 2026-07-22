import RSS from "rss";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts();

  const feed = new RSS({
    title: "T | Builder & Explorer",
    description: "AI Agent 开发者 · 光电信息科学与工程 · 汕头大学",
    feed_url: "https://iuyup.com/feed.xml",
    site_url: "https://iuyup.com",
    language: "zh-CN",
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.summary || "",
      url: `https://iuyup.com/posts/${encodeURIComponent(post.slug)}`,
      date: new Date(post.date),
      categories: post.tags || [],
    });
  });

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
