import type { Metadata } from "next";
import JournalIndex from "@/components/journal/JournalIndex";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description: "关于 AI Agent、开源与技术思考",
  openGraph: {
    title: "博客 | T",
    description: "关于 AI Agent、开源与技术思考",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "博客" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "博客 | T",
    description: "关于 AI Agent、开源与技术思考",
  },
  alternates: {
    canonical: "/posts",
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
