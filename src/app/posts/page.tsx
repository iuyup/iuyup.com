import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description: "关于 AI Agent、开源与技术思考",
  openGraph: {
    title: "博客 | T",
    description: "关于 AI Agent、开源与技术思考",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "博客" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "博客 | T",
    description: "关于 AI Agent、开源与技术思考",
  },
};

export default function PostsPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "博客列表",
    description: "关于 AI Agent、开源与技术思考",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://iuyup.com/posts/${encodeURIComponent(post.slug)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div style={{ minHeight: '100vh', backgroundAttachment: 'fixed', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url(/monet.jpg)', position: 'relative' }}>
      {/* Nav - fixed, outside the middle band */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="font-caveat text-xl leading-none hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text)' }}>
            T.
          </Link>
        </div>
      </nav>

      {/* Bottom background band - wider than content, centered */}
      <div style={{ background: 'var(--bg)', maxWidth: '900px', margin: '0 auto' }}>
        {/* Content - centered */}
        <div className="max-w-3xl mx-auto w-full px-6 py-24">
          {/* Header */}
          <header className="pb-16">
            <h1 className="font-caveat text-5xl mb-4" style={{ color: 'var(--primary)' }}>Blog</h1>
            <p style={{ color: 'var(--text-secondary)' }}>关于 AI Agent、开源与技术思考</p>
          </header>

          {/* Posts List */}
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${encodeURIComponent(post.slug)}`}
                className="block group"
              >
                <section className="p-6 rounded-xl border hover:opacity-90 transition-all duration-300" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl font-medium font-serif group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text)' }}>
                      {post.title}
                    </h2>
                    <time className="text-sm shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(post.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.summary}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full border font-sans"
                          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </Link>
            ))}
          </div>
        </div>

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
    </div>
    </>
  );
}
