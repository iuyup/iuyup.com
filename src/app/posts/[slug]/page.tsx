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
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: encodeURIComponent(post.slug) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = getPostBySlug(decodedSlug);

  if (!post) {
    return { title: "未找到" };
  }

  const description = post.frontmatter.summary || post.content.slice(0, 160);
  const image = post.frontmatter.image || "/og-image.svg";

  return {
    title: post.frontmatter.title,
    description,
    openGraph: {
      type: "article",
      publishedTime: post.frontmatter.date,
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

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-caveat text-4xl mb-6 mt-12" style={{ color: 'var(--primary)' }} {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-caveat text-3xl mb-4 mt-10" style={{ color: 'var(--primary)' }} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-medium text-lg mb-3 mt-8" style={{ color: 'var(--text)' }} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="hover:underline"
      style={{ color: 'var(--primary)' }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 pl-4 my-4 italic"
      style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { "data-language"?: string }) => {
    const { "data-language": dataLanguage, children, ...rest } = props;
    if (dataLanguage) {
      return <code className="font-mono" {...rest}>{children}</code>;
    }
    return (
      <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#E8E2DA', color: 'var(--accent)' }} {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono"
      style={{ background: '#2C2C2C', color: '#E8E2DA' }}
      {...props}
    />
  ),
  hr: () => <hr style={{ borderColor: 'var(--border)' }} className="my-8" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-medium" style={{ color: 'var(--text)' }} {...props} />
  ),
};

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-caveat text-4xl mb-6 mt-12" style={{ color: 'var(--primary)' }} {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-caveat text-3xl mb-4 mt-10" style={{ color: 'var(--primary)' }} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-medium text-lg mb-3 mt-8" style={{ color: 'var(--text)' }} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ color: 'var(--text-secondary)' }} {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="hover:underline"
      style={{ color: 'var(--primary)' }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 pl-4 my-4 italic"
      style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
    const isBlock = props.className?.includes('language-');
    if (isBlock) {
      return <code className="font-mono" {...props} />;
    }
    return <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#E8E2DA', color: 'var(--accent)' }} {...props} />;
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono"
      style={{ background: '#2C2C2C', color: '#E8E2DA' }}
      {...props}
    />
  ),
  hr: () => <hr style={{ borderColor: 'var(--border)' }} className="my-8" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-medium" style={{ color: 'var(--text)' }} {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <table className="w-full border-collapse mb-4" style={{ borderColor: 'var(--border)' }} {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border px-4 py-2 text-left" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border px-4 py-2" style={{ borderColor: 'var(--border)' }} {...props} />
  ),
  del: (props: React.HTMLAttributes<HTMLModElement>) => (
    <del className="line-through opacity-60" {...props} />
  ),
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = getPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  const filteredContent = filterObsidianSyntax(post.content);

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
    dateModified: post.frontmatter.date,
    image: post.frontmatter.image || "/og-image.svg",
    url: `https://iuyup.com/posts/${encodeURIComponent(decodedSlug)}`,
    publisher: {
      "@type": "Person",
      name: "T",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Monet Background - Fixed layer with gradient overlay */}
      <div className="fixed inset-0 z-0">
        <img src="/monet.jpg" alt="" className="w-full h-full object-cover" style={{ filter: 'saturate(0.7)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(245,240,235,0.15) 0%, rgba(245,240,235,0.15) 50%, rgba(245,240,235,0.7) 85%, #F5F0EB 100%)' }} />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">

      {/* Nav - fixed, outside the middle band */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="font-caveat text-xl leading-none hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text)' }}>
            T.
          </Link>
        </div>
      </nav>

      {/* Bottom background band - wider than content, centered */}
      <div style={{ background: 'var(--bg)', maxWidth: '900px', margin: '0 auto', color: 'var(--text)' }}>
        {/* Blog */}
        <article className="pt-32 pb-16">
          <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <header className="mb-12">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              返回博客
            </Link>
            <time className="text-sm block mb-4" style={{ color: 'var(--text-secondary)' }}>
              {new Date(post.frontmatter.date).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="font-caveat text-5xl mb-6" style={{ color: 'var(--primary)' }}>
              {post.frontmatter.title}
            </h1>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {post.frontmatter.summary}
            </p>
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.frontmatter.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full border font-sans"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose">
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
      </article>

      <Comments />

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-caveat text-base">T.</span>
          <div className="flex gap-4 font-serif">
            <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>
              GitHub
            </a>
            <a href="mailto:tyn2005315@gmail.com" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>
              Email
            </a>
          </div>
        </div>
      </footer>
      </div>

      {/* End content wrapper */}
      </div>
    </div>
    </>
  );
}
