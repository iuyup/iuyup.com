import RSS from "rss";
import { getAllNotes } from "@/lib/notes";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

export async function GET() {
  const [posts, notes] = await Promise.all([getAllPosts(), getAllNotes()]);
  const entries = [
    ...posts.map((entry) => ({ entry, path: "/posts", category: "文章" })),
    ...notes.map((entry) => ({ entry, path: "/notes", category: "随心" })),
  ].sort((left, right) => new Date(right.entry.date).getTime() - new Date(left.entry.date).getTime());

  const feed = new RSS({
    title: "iuyup",
    description: "AI Agent 开发者 · 光电信息科学与工程 · 汕头大学",
    feed_url: "https://iuyup.com/feed.xml",
    site_url: "https://iuyup.com",
    language: "zh-CN",
  });

  entries.forEach(({ entry, path, category }) => {
    feed.item({
      title: entry.title,
      description: entry.summary || "",
      url: `https://iuyup.com${path}/${encodeURIComponent(entry.slug)}`,
      date: new Date(entry.date),
      categories: [...new Set([...(entry.tags || []), category])],
    });
  });

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
