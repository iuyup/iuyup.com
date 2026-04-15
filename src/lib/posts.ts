import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostFrontmatter {
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
  image: string | undefined;
}

export interface Post extends PostFrontmatter {
  slug: string;
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
        summary: data.summary as string | undefined,
        tags: data.tags as string[] | undefined,
        image: data.image as string | undefined,
      };
    })
    .filter((post): post is Post => post !== null) as Post[];

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): { frontmatter: PostFrontmatter; content: string; isMDX: boolean } | null {
  // Try both .mdx and .md extensions
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const mdPath = path.join(postsDirectory, `${slug}.md`);

  let filePath: string;
  let isMDX = false;

  if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
    isMDX = true;
  } else if (fs.existsSync(mdPath)) {
    filePath = mdPath;
    isMDX = false;
  } else {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    frontmatter: {
      title: data.title as string,
      date: data.date as string,
      summary: (data.summary as string) || "",
      tags: (data.tags as string[]) || [],
      image: (data.image as string) || undefined,
    },
    content,
    isMDX,
  };
}
