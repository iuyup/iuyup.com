import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalEntry from "@/components/journal/JournalEntry";
import { getAllEnglishPosts, getEnglishPostBySlug } from "@/lib/english-content";
import { getSourceSlug } from "@/lib/content-translations";
import { estimateReadingTimeMinutes } from "@/lib/reading-time";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getAllEnglishPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getEnglishPostBySlug(slug);

  if (!post) {
    return { title: "Not found" };
  }

  const description = post.frontmatter.summary || post.content.slice(0, 160);
  const image = post.frontmatter.image || DEFAULT_OG_IMAGE_PATH;
  const canonical = `/en/posts/${encodeURIComponent(post.slug)}`;
  const sourceSlug = post.frontmatter.sourceSlug ?? getSourceSlug("posts", post.slug);
  const modifiedTime = post.frontmatter.updated || post.frontmatter.date;

  return {
    title: post.frontmatter.title,
    description,
    alternates: {
      canonical,
      languages: {
        ...(sourceSlug ? { "zh-CN": `/posts/${encodeURIComponent(sourceSlug)}` } : {}),
        en: canonical,
      },
      types: {
        "application/rss+xml": "/en/feed.xml",
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      locale: "en_US",
      publishedTime: post.frontmatter.date,
      modifiedTime,
      authors: ["T"],
      images: [{ url: image, width: 1200, height: 630, alt: post.frontmatter.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description,
      images: [image],
    },
  };
}

export default async function EnglishPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getEnglishPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <JournalEntry
      entry={post}
      indexHref="/en/posts"
      indexLabel="Writing"
      sectionLabel="Journal"
      metaLabel="Engineering Notes"
      readingTimeMinutes={estimateReadingTimeMinutes(post.content)}
      locale="en"
    />
  );
}
