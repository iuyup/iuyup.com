import {
  getAllContent,
  getContentBySlug,
  type ContentDocument,
  type ContentFrontmatter,
  type ContentItem,
} from "@/lib/content";

export type PostFrontmatter = ContentFrontmatter;
export type Post = ContentItem;
export type PostDocument = ContentDocument;

export function getAllPosts(): Post[] {
  return getAllContent("posts");
}

export function getPostBySlug(rawSlug: string): PostDocument | null {
  return getContentBySlug("posts", rawSlug);
}
