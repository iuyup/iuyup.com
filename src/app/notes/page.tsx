import type { Metadata } from "next";
import JournalIndex from "@/components/journal/JournalIndex";
import { getAllNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "随心",
  description: "一些没有固定主题的记录、想法与片段。",
  openGraph: {
    title: "随心 | T",
    description: "一些没有固定主题的记录、想法与片段。",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "随心" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "随心 | T",
    description: "一些没有固定主题的记录、想法与片段。",
  },
  alternates: {
    canonical: "/notes",
  },
};

export default function NotesPage() {
  return (
    <JournalIndex
      entries={getAllNotes()}
      title="随心"
      description="一些没有固定主题的记录、想法与片段。"
      path="/notes"
      listHeading="Recent Notes"
    />
  );
}
