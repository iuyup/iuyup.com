import type { Metadata } from "next";
import JournalIndex from "@/components/journal/JournalIndex";
import { getAllEnglishPosts } from "@/lib/english-content";
import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/lib/site";

const description = "Writing about AI agents, open source, and the engineering details behind working systems.";

export const metadata: Metadata = {
  title: "Writing",
  description,
  openGraph: {
    title: "Writing | iuyup",
    description,
    type: "website",
    url: `${SITE_URL}/en/posts`,
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: "iuyup writing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing | iuyup",
    description,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  alternates: {
    canonical: "/en/posts",
    languages: {
      "zh-CN": "/posts",
      en: "/en/posts",
    },
    types: {
      "application/rss+xml": "/en/feed.xml",
    },
  },
};

export default async function EnglishPostsPage() {
  const posts = await getAllEnglishPosts();

  return (
    <JournalIndex
      entries={posts}
      title="Writing"
      description={description}
      path="/en/posts"
      listHeading="Recent Writing"
      locale="en"
    />
  );
}
