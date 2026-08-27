import type { Metadata } from "next";
import JournalIndex from "@/components/journal/JournalIndex";
import { getAllNotes } from "@/lib/notes";
import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "随心",
  description: "一些没有固定主题的记录、想法与片段。",
  openGraph: {
    title: "随心 | iuyup",
    description: "一些没有固定主题的记录、想法与片段。",
    type: "website",
    url: `${SITE_URL}/notes`,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: "随心" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "随心 | iuyup",
    description: "一些没有固定主题的记录、想法与片段。",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  alternates: {
    canonical: "/notes",
  },
};

export default async function NotesPage() {
  const notes = await getAllNotes();

  return (
    <JournalIndex
      entries={notes}
      title="随心"
      description="一些没有固定主题的记录、想法与片段。"
      path="/notes"
      listHeading="Recent Notes"
    />
  );
}
