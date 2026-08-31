import fs from "fs";
import path from "path";
import { parseFrontmatter } from "@/lib/frontmatter";

export type ContentCollection = "posts" | "notes";
export type ContentLocale = "zh-CN" | "en";

const contentDirectory = path.join(process.cwd(), "content");
const publicDirectory = path.join(process.cwd(), "public");
const warnedMissingImages = new Set<string>();

export interface ContentFrontmatter {
  title: string;
  date: string;
  updated: string | undefined;
  summary: string | undefined;
  tags: string[] | undefined;
  image: string | undefined;
  sourceSlug: string | undefined;
}

export interface ContentItem extends ContentFrontmatter {
  slug: string;
}

export interface ContentDocument {
  slug: string;
  frontmatter: ContentFrontmatter;
  content: string;
  isMDX: boolean;
}

function collectionDirectory(collection: ContentCollection, locale: ContentLocale) {
  return locale === "en"
    ? path.join(contentDirectory, "en", collection)
    : path.join(contentDirectory, collection);
}

function resolveContentImage(
  image: unknown,
  collection: ContentCollection,
  slug: string
): string | undefined {
  if (typeof image !== "string" || !image.trim()) {
    return undefined;
  }

  if (!image.startsWith("/")) {
    return image;
  }

  const relativePath = image.replace(/^\/+/, "");
  const resolvedPath = path.resolve(publicDirectory, relativePath);
  const publicPrefix = `${publicDirectory}${path.sep}`;

  if (!resolvedPath.startsWith(publicPrefix) || !fs.existsSync(resolvedPath)) {
    const warningKey = `${collection}:${slug}:${image}`;
    if (!warnedMissingImages.has(warningKey)) {
      warnedMissingImages.add(warningKey);
      console.warn(`Ignoring missing local cover image for ${collection}/${slug}: ${image}`);
    }
    return undefined;
  }

  return image;
}

function normalizeContentSlug(rawSlug: string): string | null {
  try {
    const slug = decodeURIComponent(rawSlug);
    if (!slug || slug === "." || slug === ".." || /[\\/\0]/.test(slug)) {
      return null;
    }
    return slug;
  } catch {
    return null;
  }
}

function toFrontmatter(
  data: Record<string, unknown>,
  collection: ContentCollection,
  slug: string
): ContentFrontmatter {
  return {
    title: data.title as string,
    date: data.date as string,
    updated: data.updated as string | undefined,
    summary: (data.summary as string) || undefined,
    tags: data.tags as string[] | undefined,
    image: resolveContentImage(data.image, collection, slug),
    sourceSlug: typeof data.sourceSlug === "string" ? data.sourceSlug : undefined,
  };
}

export function getAllContent(collection: ContentCollection, locale: ContentLocale = "zh-CN"): ContentItem[] {
  let files: string[];
  try {
    files = fs.readdirSync(collectionDirectory(collection, locale));
  } catch {
    return [];
  }

  const items = files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const filePath = path.join(collectionDirectory(collection, locale), file);

      let fileContent: string;
      try {
        fileContent = fs.readFileSync(filePath, "utf-8");
      } catch {
        return null;
      }

      const { data, content } = parseFrontmatter(fileContent);
      if (!data || !data.title || !data.date || content.trim().length < 10) {
        return null;
      }

      return {
        slug,
        ...toFrontmatter(data, collection, slug),
      };
    })
    .filter((item): item is ContentItem => item !== null);

  return items.sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

export function getContentBySlug(
  collection: ContentCollection,
  rawSlug: string,
  locale: ContentLocale = "zh-CN"
): ContentDocument | null {
  const slug = normalizeContentSlug(rawSlug);
  if (!slug) {
    return null;
  }

  let files: string[];
  try {
    files = fs.readdirSync(collectionDirectory(collection, locale));
  } catch {
    return null;
  }

  const fileName = files.find(
    (file) => (file.endsWith(".mdx") || file.endsWith(".md")) && file.replace(/\.mdx?$/, "") === slug
  );
  if (!fileName) {
    return null;
  }

  const filePath = path.join(collectionDirectory(collection, locale), fileName);
  const isMDX = fileName.endsWith(".mdx");
  const { data, content } = parseFrontmatter(fs.readFileSync(filePath, "utf-8"));

  return {
    slug,
    frontmatter: toFrontmatter(data, collection, slug),
    content,
    isMDX,
  };
}
