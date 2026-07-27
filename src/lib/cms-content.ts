import type { ContentCollection, ContentDocument, ContentFrontmatter, ContentItem } from "@/lib/content";
import { getAllContent, getContentBySlug } from "@/lib/content";
import { sanityClient } from "@/sanity/lib/client";
import {
  ALL_NOTES_QUERY,
  ALL_POSTS_QUERY,
  NOTE_BY_SLUG_QUERY,
  POST_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

interface SanityJournalEntry {
  slug?: string;
  title?: string;
  publishedAt?: string;
  updatedAt?: string;
  summary?: string;
  tags?: string[];
  coverImage?: string;
  body?: string;
  contentFormat?: "markdown" | "mdx";
}

const queries = {
  posts: {
    all: ALL_POSTS_QUERY,
    bySlug: POST_BY_SLUG_QUERY,
    cacheTag: "sanity-posts",
  },
  notes: {
    all: ALL_NOTES_QUERY,
    bySlug: NOTE_BY_SLUG_QUERY,
    cacheTag: "sanity-notes",
  },
} as const;

const warnedCollections = new Set<ContentCollection>();

function getSanityCacheOptions(cacheTag: string, slug?: string) {
  // A developer often creates or publishes content while the local server is
  // already running. Do not keep an earlier empty result for an hour in that
  // workflow; production keeps the static cache and invalidates it by webhook.
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" as const };
  }

  return {
    cache: "force-cache" as const,
    next: {
      revalidate: 3600,
      tags: ["sanity-content", cacheTag, ...(slug ? [`sanity-${slug}`] : [])],
    },
  };
}

function normalizeSlug(rawSlug: string): string | null {
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

function toFrontmatter(entry: SanityJournalEntry): ContentFrontmatter | null {
  if (!entry.title || !entry.publishedAt) {
    return null;
  }

  return {
    title: entry.title,
    date: entry.publishedAt,
    updated: entry.updatedAt,
    summary: entry.summary || undefined,
    tags: Array.isArray(entry.tags) ? entry.tags.filter((tag) => typeof tag === "string") : undefined,
    image: entry.coverImage || undefined,
  };
}

function toContentItem(entry: SanityJournalEntry): ContentItem | null {
  const frontmatter = toFrontmatter(entry);
  if (!frontmatter || !entry.slug) {
    return null;
  }

  return { slug: entry.slug, ...frontmatter };
}

function toContentDocument(entry: SanityJournalEntry): ContentDocument | null {
  const frontmatter = toFrontmatter(entry);
  if (!frontmatter || !entry.slug || typeof entry.body !== "string") {
    return null;
  }

  return {
    slug: entry.slug,
    frontmatter,
    content: entry.body,
    isMDX: entry.contentFormat === "mdx",
  };
}

function warnAndFallback(collection: ContentCollection, error: unknown) {
  if (warnedCollections.has(collection)) {
    return;
  }

  warnedCollections.add(collection);
  const reason = error instanceof Error ? error.message : "unknown error";
  console.warn(`[Sanity] ${collection} query failed; using local Markdown fallback: ${reason}`);
}

async function fetchAllSanityContent(collection: ContentCollection): Promise<ContentItem[]> {
  const { all, cacheTag } = queries[collection];

  try {
    const entries = await sanityClient.fetch<SanityJournalEntry[]>(
      all,
      {},
      getSanityCacheOptions(cacheTag)
    );

    return entries
      .map(toContentItem)
      .filter((entry): entry is ContentItem => entry !== null)
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  } catch (error) {
    warnAndFallback(collection, error);
    return [];
  }
}

async function fetchSanityContentBySlug(
  collection: ContentCollection,
  slug: string
): Promise<ContentDocument | null> {
  const { bySlug, cacheTag } = queries[collection];

  try {
    const entry = await sanityClient.fetch<SanityJournalEntry | null>(
      bySlug,
      { slug },
      getSanityCacheOptions(cacheTag, `${collection}-${slug}`)
    );

    return entry ? toContentDocument(entry) : null;
  } catch (error) {
    warnAndFallback(collection, error);
    return null;
  }
}

export async function getAllContentWithCms(collection: ContentCollection): Promise<ContentItem[]> {
  const [sanityEntries, localEntries] = await Promise.all([
    fetchAllSanityContent(collection),
    Promise.resolve(getAllContent(collection)),
  ]);
  const remoteSlugs = new Set(sanityEntries.map((entry) => entry.slug));

  return [...sanityEntries, ...localEntries.filter((entry) => !remoteSlugs.has(entry.slug))].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
  );
}

export async function getContentBySlugWithCms(
  collection: ContentCollection,
  rawSlug: string
): Promise<ContentDocument | null> {
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    return null;
  }

  const sanityEntry = await fetchSanityContentBySlug(collection, slug);
  return sanityEntry ?? getContentBySlug(collection, slug);
}
