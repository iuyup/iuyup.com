import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

function toValidDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://iuyup.com";
  const posts = getAllPosts();
  const latestPostModified = posts.reduce<Date | undefined>((latest, post) => {
    const modified = toValidDate(post.updated) ?? toValidDate(post.date);
    if (!modified || (latest && modified <= latest)) {
      return latest;
    }
    return modified;
  }, undefined);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      ...(latestPostModified ? { lastModified: latestPostModified } : {}),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/posts`,
      ...(latestPostModified ? { lastModified: latestPostModified } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
    const lastModified = toValidDate(post.updated) ?? toValidDate(post.date);

    return {
      url: `${baseUrl}/posts/${encodeURIComponent(post.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  return [...staticPages, ...blogPages];
}
