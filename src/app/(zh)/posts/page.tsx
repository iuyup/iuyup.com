import type { Metadata } from "next";
import JournalIndex from "@/components/journal/JournalIndex";
import { getAllPosts } from "@/lib/posts";
import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "博客",
  description: "关于 AI Agent、开源与技术思考",
  openGraph: {
    title: "博客 | iuyup",
    description: "关于 AI Agent、开源与技术思考",
    type: "website",
    url: `${SITE_URL}/posts`,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: "博客" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "博客 | iuyup",
    description: "关于 AI Agent、开源与技术思考",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  alternates: {
    canonical: "/posts",
    languages: {
      "zh-CN": "/posts",
      en: "/en/posts",
    },
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <JournalIndex
      entries={posts}
      title="文章"
      description="关于 AI Agent、开源与技术思考。"
      path="/posts"
      listHeading="Recent Writing"
    />
  );
}
