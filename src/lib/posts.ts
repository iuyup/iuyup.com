import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");
const publicDirectory = path.join(process.cwd(), "public");
const warnedMissingImages = new Set<string>();

export interface PostFrontmatter {
  title: string;
  date: string;
  updated: string | undefined;
  summary: string | undefined;
  tags: string[] | undefined;
  image: string | undefined;
}

export interface Post extends PostFrontmatter {
  slug: string;
}

export interface PostDocument {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  isMDX: boolean;
}

function resolvePostImage(image: unknown, slug: string): string | undefined {
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
    const warningKey = `${slug}:${image}`;
    if (!warnedMissingImages.has(warningKey)) {
      warnedMissingImages.add(warningKey);
      console.warn(`Ignoring missing local cover image for post "${slug}": ${image}`);
    }
    return undefined;
  }

  return image;
}

export function getAllPosts(): Post[] {
  let files: string[];
  try {
    files = fs.readdirSync(postsDirectory);
  } catch {
    return [];
  }

  const posts = files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const filePath = path.join(postsDirectory, file);

      let fileContent: string;
      try {
        fileContent = fs.readFileSync(filePath, "utf-8");
      } catch {
        return null;
      }

      const { data, content } = matter(fileContent);

      // Skip files without frontmatter or required fields
      if (!data || !data.title || !data.date) {
        return null;
      }

      // Skip files with empty content (less than 10 chars after frontmatter)
      const contentStart = content.trim();
      if (contentStart.length < 10) {
        return null;
      }

      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        updated: data.updated as string | undefined,
        summary: data.summary as string | undefined,
        tags: data.tags as string[] | undefined,
        image: resolvePostImage(data.image, slug),
      };
    })
    .filter((post): post is Post => post !== null) as Post[];

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function normalizePostSlug(rawSlug: string): string | null {
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

export function getPostBySlug(rawSlug: string): PostDocument | null {
  const slug = normalizePostSlug(rawSlug);
  if (!slug) {
    return null;
  }

  let files: string[];
  try {
    files = fs.readdirSync(postsDirectory);
  } catch {
    return null;
  }

  const fileName = files.find((file) =>
    (file.endsWith(".mdx") || file.endsWith(".md")) && file.replace(/\.mdx?$/, "") === slug
  );
  if (!fileName) {
    return null;
  }

  const filePath = path.join(postsDirectory, fileName);
  const isMDX = fileName.endsWith(".mdx");

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    frontmatter: {
      title: data.title as string,
      date: data.date as string,
      updated: data.updated as string | undefined,
      summary: (data.summary as string) || "",
      tags: (data.tags as string[]) || [],
      image: resolvePostImage(data.image, slug),
    },
    content,
    isMDX,
  };
}
