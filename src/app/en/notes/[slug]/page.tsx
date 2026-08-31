import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalEntry from "@/components/journal/JournalEntry";
import ReadingProgress from "@/components/journal/ReadingProgress";
import { getAllEnglishNotes, getEnglishNoteBySlug } from "@/lib/english-content";
import { getSourceSlug } from "@/lib/content-translations";
import { estimateReadingTimeMinutes } from "@/lib/reading-time";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

export async function generateStaticParams() {
  const notes = await getAllEnglishNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = await getEnglishNoteBySlug(slug);

  if (!note) {
    return { title: "Not found" };
  }

  const description = note.frontmatter.summary || note.content.slice(0, 160);
  const image = note.frontmatter.image || DEFAULT_OG_IMAGE_PATH;
  const canonical = `/en/notes/${encodeURIComponent(note.slug)}`;
  const sourceSlug = note.frontmatter.sourceSlug ?? getSourceSlug("notes", note.slug);
  const modifiedTime = note.frontmatter.updated || note.frontmatter.date;

  return {
    title: note.frontmatter.title,
    description,
    alternates: {
      canonical,
      languages: {
        ...(sourceSlug ? { "zh-CN": `/notes/${encodeURIComponent(sourceSlug)}` } : {}),
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

export default async function EnglishNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getEnglishNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <>
      <JournalEntry
        entry={note}
        indexHref="/en/notes"
        indexLabel="Field Notes"
        sectionLabel="Field Notes"
        readingTimeMinutes={estimateReadingTimeMinutes(note.content)}
        locale="en"
      />
      <ReadingProgress targetId="article-content" ariaLabel="Back to the note title" />
    </>
  );
}
