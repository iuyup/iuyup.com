import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-sm border-b" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-caveat text-xl leading-none hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text)' }}>
            T.
          </Link>
          <div className="flex gap-5 text-sm items-center self-center font-serif" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/#about" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>About</Link>
            <Link href="/#projects" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>Projects</Link>
            <Link href="/#music" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>Music</Link>
            <Link href="/posts" className="hover:text-[var(--text)] transition-colors" style={{ color: 'inherit' }}>Blog</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-32 pb-16 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-caveat text-5xl mb-4" style={{ color: 'var(--primary)' }}>Blog</h1>
          <p style={{ color: 'var(--text-secondary)' }}>关于 AI Agent、开源与技术思考</p>
        </div>
      </header>

      {/* Posts List */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${encodeURIComponent(post.slug)}`}
              className="block group"
            >
              <article className="p-6 rounded-xl border hover:opacity-90 transition-all duration-300" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
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
              </article>
            </Link>
          ))}
        </div>
      </main>

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
  );
}
