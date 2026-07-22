import type { ContentDocument, ContentFrontmatter, ContentItem } from "@/lib/content";
import { getAllContentWithCms, getContentBySlugWithCms } from "@/lib/cms-content";

export type PostFrontmatter = ContentFrontmatter;
export type Post = ContentItem;
export type PostDocument = ContentDocument;

export async function getAllPosts(): Promise<Post[]> {
  return getAllContentWithCms("posts");
}

export async function getPostBySlug(rawSlug: string): Promise<PostDocument | null> {
  return getContentBySlugWithCms("posts", rawSlug);
}
