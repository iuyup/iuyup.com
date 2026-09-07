import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalEntry from "@/components/journal/JournalEntry";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { getEnglishSlug } from "@/lib/content-translations";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

export async function generateStaticParams() {
  const notes = await getAllNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) {
    return { title: "未找到" };
  }

  const description = note.frontmatter.summary || note.content.slice(0, 160);
  const image = note.frontmatter.image || DEFAULT_OG_IMAGE_PATH;
  const canonical = `/notes/${encodeURIComponent(note.slug)}`;
  const englishSlug = getEnglishSlug("notes", note.slug);
  const modifiedTime = note.frontmatter.updated || note.frontmatter.date;

  return {
    title: note.frontmatter.title,
    description,
    alternates: {
      canonical,
      languages: {
        "zh-CN": canonical,
        ...(englishSlug ? { en: `/en/notes/${encodeURIComponent(englishSlug)}` } : {}),
      },
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      publishedTime: note.frontmatter.date,
      modifiedTime,
      authors: ["T"],
      images: [{ url: image, width: 1200, height: 630, alt: note.frontmatter.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: note.frontmatter.title,
      description,
      images: [image],
    },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return <JournalEntry entry={note} indexHref="/notes" indexLabel="随心" sectionLabel="随心" />;
}
