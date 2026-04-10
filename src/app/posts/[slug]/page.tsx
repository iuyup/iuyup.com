import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import rehypePrettyCode from "rehype-pretty-code";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

const components = {
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
      return <code {...rest}>{children}</code>;
    }
    return (
      <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: 'var(--surface)', color: 'var(--accent)' }} {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="rounded-lg p-4 overflow-x-auto mb-4 text-sm"
      style={{ background: 'var(--code-bg)' }}
      {...props}
    />
  ),
  hr: () => <hr style={{ borderColor: 'var(--border)' }} className="my-8" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-medium" style={{ color: 'var(--text)' }} {...props} />
  ),
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-sm border-b" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-caveat text-xl hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text)' }}>
            T.
          </Link>
          <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/#about" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>About</Link>
            <Link href="/#projects" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>Projects</Link>
            <Link href="/posts" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>Blog</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Article */}
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
            {post.frontmatter.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full border"
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
            <MDXRemote
              source={post.content}
              components={components}
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
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-caveat text-base">T.</span>
          <div className="flex gap-4">
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
  );
}
