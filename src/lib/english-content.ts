import { getAllContent, getContentBySlug } from "@/lib/content";

export async function getAllEnglishPosts() {
  return getAllContent("posts", "en");
}

export async function getEnglishPostBySlug(rawSlug: string) {
  return getContentBySlug("posts", rawSlug, "en");
}

export async function getAllEnglishNotes() {
  return getAllContent("notes", "en");
}

export async function getEnglishNoteBySlug(rawSlug: string) {
  return getContentBySlug("notes", rawSlug, "en");
}
