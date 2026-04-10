import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import rehypePrettyCode from "rehype-pretty-code";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-caveat text-4xl text-[#6B8DAE] mb-6 mt-12" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-caveat text-3xl text-[#6B8DAE] mb-4 mt-10" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-medium text-lg text-[#2C2C2C] mb-3 mt-8" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[#6B6B6B] leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-[#6B6B6B] mb-4 space-y-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-[#6B6B6B] mb-4 space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-[#6B6B6B]" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-[#6B8DAE] hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-[#D4856A] pl-4 my-4 text-[#6B6B6B] italic"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { "data-language"?: string }) => {
    const { "data-language": dataLanguage, children, ...rest } = props;
    if (dataLanguage) {
      return <code {...rest}>{children}</code>;
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-[#E8E2DA] text-[#D4856A] text-sm" {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-[#1a1a2e] rounded-lg p-4 overflow-x-auto mb-4 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="border-[#D5CEC7] my-8" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-medium text-[#2C2C2C]" {...props} />
  ),
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#2C2C2C] selection:bg-[#D4856A]/30">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F0EB]/80 backdrop-blur-sm border-b border-[#D5CEC7]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-caveat text-xl text-[#2C2C2C] hover:text-[#6B8DAE] transition-colors">
            T.
          </Link>
          <div className="flex gap-6 text-sm text-[#6B6B6B]">
            <Link href="/#about" className="hover:text-[#2C2C2C] transition-colors">About</Link>
            <Link href="/#projects" className="hover:text-[#2C2C2C] transition-colors">Projects</Link>
            <Link href="/posts" className="hover:text-[#2C2C2C] transition-colors">Blog</Link>
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
              className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#6B8DAE] mb-8 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              返回博客
            </Link>
            <time className="text-sm text-[#6B6B6B] block mb-4">
              {new Date(post.frontmatter.date).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="font-caveat text-5xl text-[#6B8DAE] mb-6">
              {post.frontmatter.title}
            </h1>
            <p className="text-lg text-[#6B6B6B] leading-relaxed mb-6">
              {post.frontmatter.summary}
            </p>
            {post.frontmatter.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-[#E8E2DA] border border-[#D5CEC7] text-[#6B6B6B]"
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
                        theme: "github-light",
                        keepBackground: false,
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
      <footer className="py-12 border-t border-[#D5CEC7]">
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center text-sm text-[#6B6B6B]">
          <span className="font-caveat text-base">T.</span>
          <div className="flex gap-4">
            <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C2C2C] transition-colors">
              GitHub
            </a>
            <a href="mailto:tyn2005315@gmail.com" className="hover:text-[#2C2C2C] transition-colors">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
