import { MetadataRoute } from "next";
import type { ContentItem } from "@/lib/content";
import { getAllNotes } from "@/lib/notes";
import { getAllPosts } from "@/lib/posts";
import { getAllEnglishNotes, getAllEnglishPosts } from "@/lib/english-content";
import { getEnglishSlug, getSourceSlug, type TranslatedCollection } from "@/lib/content-translations";
import { SITE_URL } from "@/lib/site";

function toValidDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function latestModified(entries: ContentItem[]): Date | undefined {
  return entries.reduce<Date | undefined>((latest, entry) => {
    const modified = toValidDate(entry.updated) ?? toValidDate(entry.date);
    if (!modified || (latest && modified <= latest)) {
      return latest;
    }
    return modified;
  }, undefined);
}

function collectionPages(
  baseUrl: string,
  path: string,
  entries: ContentItem[],
  collection: TranslatedCollection,
  locale: "zh-CN" | "en" = "zh-CN"
): MetadataRoute.Sitemap {
  return entries.map((entry) => {
    const lastModified = toValidDate(entry.updated) ?? toValidDate(entry.date);
    const sourceSlug = locale === "en" ? entry.sourceSlug ?? getSourceSlug(collection, entry.slug) : entry.slug;
    const englishSlug = locale === "en" ? entry.slug : getEnglishSlug(collection, entry.slug);
    const alternates = sourceSlug && englishSlug
      ? {
          languages: {
            "zh-CN": `${baseUrl}/${collection}/${encodeURIComponent(sourceSlug)}`,
            en: `${baseUrl}/en/${collection}/${encodeURIComponent(englishSlug)}`,
          },
        }
      : undefined;

    return {
      url: `${baseUrl}${path}/${encodeURIComponent(entry.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly",
      priority: 0.6,
      ...(alternates ? { alternates } : {}),
    };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, notes, englishPosts, englishNotes] = await Promise.all([
    getAllPosts(),
    getAllNotes(),
    getAllEnglishPosts(),
    getAllEnglishNotes(),
  ]);
  const latestPostModified = latestModified([...posts, ...englishPosts]);
  const latestNoteModified = latestModified([...notes, ...englishNotes]);
  const latestContentModified = latestModified([
    ...posts,
    ...notes,
    ...englishPosts,
    ...englishNotes,
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      ...(latestContentModified ? { lastModified: latestContentModified } : {}),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/`,
          en: `${SITE_URL}/en`,
          "x-default": `${SITE_URL}/`,
        },
      },
    },
    {
      url: `${SITE_URL}/en`,
      ...(latestContentModified ? { lastModified: latestContentModified } : {}),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/`,
          en: `${SITE_URL}/en`,
          "x-default": `${SITE_URL}/`,
        },
      },
    },
    {
      url: `${SITE_URL}/posts`,
      ...(latestPostModified ? { lastModified: latestPostModified } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/posts`,
          en: `${SITE_URL}/en/posts`,
        },
      },
    },
    {
      url: `${SITE_URL}/notes`,
      ...(latestNoteModified ? { lastModified: latestNoteModified } : {}),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/notes`,
          en: `${SITE_URL}/en/notes`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/posts`,
      ...(latestPostModified ? { lastModified: latestPostModified } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/posts`,
          en: `${SITE_URL}/en/posts`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/notes`,
      ...(latestNoteModified ? { lastModified: latestNoteModified } : {}),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/notes`,
          en: `${SITE_URL}/en/notes`,
        },
      },
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [
    ...staticPages,
    ...collectionPages(SITE_URL, "/posts", posts, "posts"),
    ...collectionPages(SITE_URL, "/notes", notes, "notes"),
    ...collectionPages(SITE_URL, "/en/posts", englishPosts, "posts", "en"),
    ...collectionPages(SITE_URL, "/en/notes", englishNotes, "notes", "en"),
  ];
}
