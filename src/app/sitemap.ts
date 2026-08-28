import { MetadataRoute } from "next";
import type { ContentItem } from "@/lib/content";
import { getAllNotes } from "@/lib/notes";
import { getAllPosts } from "@/lib/posts";
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

function collectionPages(baseUrl: string, path: string, entries: ContentItem[]): MetadataRoute.Sitemap {
  return entries.map((entry) => {
    const lastModified = toValidDate(entry.updated) ?? toValidDate(entry.date);

    return {
      url: `${baseUrl}${path}/${encodeURIComponent(entry.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, notes] = await Promise.all([getAllPosts(), getAllNotes()]);
  const latestPostModified = latestModified(posts);
  const latestNoteModified = latestModified(notes);
  const latestContentModified = latestModified([...posts, ...notes]);

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
    },
    {
      url: `${SITE_URL}/notes`,
      ...(latestNoteModified ? { lastModified: latestNoteModified } : {}),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [
    ...staticPages,
    ...collectionPages(SITE_URL, "/posts", posts),
    ...collectionPages(SITE_URL, "/notes", notes),
  ];
}
