import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalEntry from "@/components/journal/JournalEntry";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { estimateReadingTimeMinutes } from "@/lib/reading-time";
import { getEnglishSlug } from "@/lib/content-translations";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "未找到" };
  }

  const description = post.frontmatter.summary || post.content.slice(0, 160);
  const image = post.frontmatter.image || DEFAULT_OG_IMAGE_PATH;
  const canonical = `/posts/${encodeURIComponent(post.slug)}`;
  const englishSlug = getEnglishSlug("posts", post.slug);
  const modifiedTime = post.frontmatter.updated || post.frontmatter.date;

  return {
    title: post.frontmatter.title,
    description,
    alternates: {
      canonical,
      languages: {
        "zh-CN": canonical,
        ...(englishSlug ? { en: `/en/posts/${encodeURIComponent(englishSlug)}` } : {}),
      },
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <JournalEntry
      entry={post}
      indexHref="/posts"
      indexLabel="文章"
      sectionLabel="Journal"
      metaLabel="Personal Notes"
      readingTimeMinutes={estimateReadingTimeMinutes(post.content)}
    />
  );
}
