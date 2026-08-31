import type { Metadata } from "next";
import JournalIndex from "@/components/journal/JournalIndex";
import { getAllEnglishNotes } from "@/lib/english-content";
import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/lib/site";

const description = "Short notes, loose thoughts, and fragments without a fixed theme.";

export const metadata: Metadata = {
  title: "Field Notes",
  description,
  openGraph: {
    title: "Field Notes | iuyup",
    description,
    type: "website",
    url: `${SITE_URL}/en/notes`,
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: "iuyup field notes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Notes | iuyup",
    description,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  alternates: {
    canonical: "/en/notes",
    languages: {
      "zh-CN": "/notes",
      en: "/en/notes",
    },
    types: {
      "application/rss+xml": "/en/feed.xml",
    },
  },
};

export default async function EnglishNotesPage() {
  const notes = await getAllEnglishNotes();

  return (
    <JournalIndex
      entries={notes}
      title="Field Notes"
      description={description}
      path="/en/notes"
      listHeading="Recent Notes"
      locale="en"
    />
  );
}
