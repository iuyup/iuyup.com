import type { Metadata } from "next";
import HomeLanding from "@/components/home/HomeLanding";
import { getAllPosts } from "@/lib/posts";
import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "T — AI Agent Developer",
  description:
    "T is an AI agent developer and student at Shantou University, building practical agent systems and studying open-source software from the inside out.",
  openGraph: {
    title: "T — AI Agent Developer",
    description:
      "AI agents, retrieval systems, source-code studies, and the projects I am building along the way.",
    type: "website",
    url: `${SITE_URL}/en`,
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: "iuyup" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "T — AI Agent Developer",
    description:
      "AI agents, retrieval systems, source-code studies, and the projects I am building along the way.",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  alternates: {
    canonical: "/en",
    languages: {
      "zh-CN": "/",
      en: "/en",
      "x-default": "/",
    },
  },
};

export default async function EnglishHomePage() {
  const posts = await getAllPosts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "iuyup",
    url: `${SITE_URL}/en`,
    inLanguage: "en",
  };

  return <HomeLanding locale="en" posts={posts} jsonLd={jsonLd} />;
}
