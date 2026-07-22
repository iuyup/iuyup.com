import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeHighlight from "rehype-highlight";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import Comments from "@/components/ui/Comments";
import ArticleToolbar from "@/components/ui/ArticleToolbar";
import JsonLd from "@/components/JsonLd";
import styles from "./post.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "未找到" };
  }

  const description = post.frontmatter.summary || post.content.slice(0, 160);
  const image = post.frontmatter.image || "/og-image.svg";
  const canonical = `/posts/${encodeURIComponent(post.slug)}`;
  const modifiedTime = post.frontmatter.updated || post.frontmatter.date;

  return {
    title: post.frontmatter.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      publishedTime: post.frontmatter.date,
      modifiedTime,
      authors: ["T"],
      images: [{ url: image, width: 1200, height: 630, alt: post.frontmatter.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description,
      images: [image],
    },
  };
}

// Filter out Obsidian wiki links like ![[note]] or [[note]]
function filterObsidianSyntax(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
    .replace(/!\[\[([^\]]+)\]\]/g, "") // Remove ![[]] embeds
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2") // [[note|display]] -> display
    .replace(/\[\[([^\]]+)\]\]/g, "$1") // [[note]] -> note
    .replace(/!\[\[([^\]]+)\|([^\]]+)\]\]/g, ""); // Remove ![[note|display]]
}

function removeLeadingDuplicateTitle(content: string, title: string): string {
  const leadingHeading = content.match(/^(?:[ \t]*\r?\n)*[ \t]*#\s+(.+?)(?:\s+#+)?[ \t]*(?:\r?\n|$)/);
  if (!leadingHeading || leadingHeading[1].trim() !== title.trim()) {
    return content;
  }

  return content.slice(leadingHeading[0].length);
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => <code {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} />,
  hr: () => <hr />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} />,
};

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => <code {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} />,
  hr: () => <hr />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} />,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <table {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} />
  ),
  del: (props: React.HTMLAttributes<HTMLModElement>) => (
    <del {...props} />
  ),
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const filteredContent = removeLeadingDuplicateTitle(
    filterObsidianSyntax(post.content),
    post.frontmatter.title
  );
  const image = post.frontmatter.image || "/og-image.svg";
  const canonical = `https://iuyup.com/posts/${encodeURIComponent(post.slug)}`;
  const modifiedTime = post.frontmatter.updated || post.frontmatter.date;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.summary || post.content.slice(0, 160),
    author: {
      "@type": "Person",
      name: "T",
      url: "https://iuyup.com",
    },
    datePublished: post.frontmatter.date,
    dateModified: modifiedTime,
    image,
    mainEntityOfPage: canonical,
    url: canonical,
    publisher: {
      "@type": "Person",
      name: "T",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className={styles.page}>
        <article className={styles.article}>
          <ArticleToolbar />
          <div className={styles.rule} />

          <div className={styles.layout}>
            <header className={styles.masthead}>
              <p className={styles.eyebrow}>T. / Journal</p>
              <h1 className={styles.title}>{post.frontmatter.title}</h1>
              <div className={styles.tags} aria-label="文章标签与导航">
                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                  <div className={styles.tagList}>
                  {post.frontmatter.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  </div>
                )}
                <Link href="/posts" className={styles.backToPosts} aria-label="返回文章目录">
                  /back
                </Link>
              </div>
            </header>

            <div className={styles.readingColumn}>
              <header className={styles.meta}>
                <div className={styles.metaTop}>
                  <time className={styles.date}>
                    {new Date(post.frontmatter.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <p className={styles.metaLabel}>Personal Notes</p>
                </div>
                {post.frontmatter.summary && (
                  <p className={styles.summary}>{post.frontmatter.summary}</p>
                )}
              </header>

              <div id="article-content" className={styles.prose}>
            {post.isMDX ? (
              <MDXRemote
                source={filteredContent}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    rehypePlugins: [
                      [
                        rehypePrettyCode,
                        {
                          theme: {
                            dark: "github-dark",
                            light: "github-light",
                          },
                          defaultColorScheme: "auto",
                        },
                      ],
                    ],
                  },
                }}
              />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {filteredContent}
              </ReactMarkdown>
            )}
              </div>
            </div>
          </div>
        </article>

        <section className={styles.discussion}>
          <div className={styles.discussionInner}>
            <Comments />
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span className={styles.footerBrand}>T.</span>
            <div className={styles.footerLinks}>
              <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="mailto:tyn2005315@gmail.com">Email</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
