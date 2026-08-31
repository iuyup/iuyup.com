import RSS from "rss";
import { getAllEnglishNotes, getAllEnglishPosts } from "@/lib/english-content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const [posts, notes] = await Promise.all([getAllEnglishPosts(), getAllEnglishNotes()]);
  const entries = [
    ...posts.map((entry) => ({ entry, path: "/en/posts", category: "Writing" })),
    ...notes.map((entry) => ({ entry, path: "/en/notes", category: "Field Notes" })),
  ].sort((left, right) => new Date(right.entry.date).getTime() - new Date(left.entry.date).getTime());

  const feedUrl = `${SITE_URL}/en/feed.xml`;
  const feed = new RSS({
    title: "iuyup — English",
    description: "AI agents, open source, engineering notes, and fragments from everyday life.",
    feed_url: feedUrl,
    site_url: `${SITE_URL}/en`,
    language: "en",
  });

  entries.forEach(({ entry, path, category }) => {
    feed.item({
      title: entry.title,
      description: entry.summary || "",
      url: `${SITE_URL}${path}/${encodeURIComponent(entry.slug)}`,
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
