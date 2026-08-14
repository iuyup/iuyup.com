import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeHighlight from "rehype-highlight";
import Comments from "@/components/ui/Comments";
import ArticleToolbar from "@/components/ui/ArticleToolbar";
import JsonLd from "@/components/JsonLd";
import type { ContentDocument } from "@/lib/content";
import styles from "@/app/posts/[slug]/post.module.css";

interface JournalEntryProps {
  entry: ContentDocument;
  indexHref: string;
  indexLabel: string;
  sectionLabel: string;
  metaLabel?: string;
  readingTimeMinutes?: number;
}

function filterObsidianSyntax(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[\[([^\]]+)\]\]/g, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/!\[\[([^\]]+)\|([^\]]+)\]\]/g, "");
}

function removeLeadingDuplicateTitle(content: string, title: string): string {
  const leadingHeading = content.match(/^(?:[ \t]*\r?\n)*[ \t]*#\s+(.+?)(?:\s+#+)?[ \t]*(?:\r?\n|$)/);
  if (!leadingHeading || leadingHeading[1].trim() !== title.trim()) {
    return content;
  }

  return content.slice(leadingHeading[0].length);
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => <blockquote {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} />,
  hr: () => <hr />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} />,
};

const markdownComponents = {
  ...mdxComponents,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => <table {...props} />,
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => <th {...props} />,
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props} />,
  del: (props: React.HTMLAttributes<HTMLModElement>) => <del {...props} />,
};

export default function JournalEntry({
  entry,
  indexHref,
  indexLabel,
  sectionLabel,
  metaLabel,
  readingTimeMinutes,
}: JournalEntryProps) {
  const filteredContent = removeLeadingDuplicateTitle(
    filterObsidianSyntax(entry.content),
    entry.frontmatter.title
  );
  const image = entry.frontmatter.image || "/og-image.svg";
  const canonical = `https://iuyup.com${indexHref}/${encodeURIComponent(entry.slug)}`;
  const modifiedTime = entry.frontmatter.updated || entry.frontmatter.date;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.frontmatter.title,
    description: entry.frontmatter.summary || entry.content.slice(0, 160),
    articleSection: sectionLabel,
    author: {
      "@type": "Person",
      name: "T",
      url: "https://iuyup.com",
    },
    datePublished: entry.frontmatter.date,
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
              <p className={styles.eyebrow}>T. / {sectionLabel}</p>
              <h1 className={styles.title}>{entry.frontmatter.title}</h1>
              <div className={styles.tags} aria-label={`${sectionLabel}标签与导航`}>
                {entry.frontmatter.tags && entry.frontmatter.tags.length > 0 && (
                  <div className={styles.tagList}>
                    {entry.frontmatter.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link href={indexHref} className={styles.backToPosts} aria-label={`返回${indexLabel}目录`}>
                  /back
                </Link>
              </div>
            </header>

            <div className={styles.readingColumn}>
              <header className={styles.meta}>
                <div className={styles.metaTop}>
                  <time className={styles.date}>
                    {new Date(entry.frontmatter.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <div className={styles.metaDetails}>
                    <p className={styles.metaLabel}>{metaLabel ?? sectionLabel}</p>
                    {readingTimeMinutes !== undefined && (
                      <p className={styles.readingTime}>约 {readingTimeMinutes} 分钟阅读</p>
                    )}
                  </div>
                </div>
                {entry.frontmatter.summary && <p className={styles.summary}>{entry.frontmatter.summary}</p>}
              </header>

              <div id="article-content" className={styles.prose}>
                {entry.isMDX ? (
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
