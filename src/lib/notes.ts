import {
  getAllContent,
  getContentBySlug,
  type ContentDocument,
  type ContentItem,
} from "@/lib/content";

export type Note = ContentItem;
export type NoteDocument = ContentDocument;

export function getAllNotes(): Note[] {
  return getAllContent("notes");
}

export function getNoteBySlug(rawSlug: string): NoteDocument | null {
  return getContentBySlug("notes", rawSlug);
}
