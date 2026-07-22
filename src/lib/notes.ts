import type { ContentDocument, ContentItem } from "@/lib/content";
import { getAllContentWithCms, getContentBySlugWithCms } from "@/lib/cms-content";

export type Note = ContentItem;
export type NoteDocument = ContentDocument;

export async function getAllNotes(): Promise<Note[]> {
  return getAllContentWithCms("notes");
}

export async function getNoteBySlug(rawSlug: string): Promise<NoteDocument | null> {
  return getContentBySlugWithCms("notes", rawSlug);
}
