import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function PostsPage() {
  const posts = getAllPosts();

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

      {/* Header */}
      <header className="pt-32 pb-16 border-b border-[#D5CEC7]">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-caveat text-5xl text-[#6B8DAE] mb-4">Blog</h1>
          <p className="text-[#6B6B6B]">关于 AI Agent、开源与技术思考</p>
        </div>
      </header>

      {/* Posts List */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="block group"
            >
              <article className="p-6 rounded-xl bg-[#E8E2DA]/60 border border-[#D5CEC7] hover:bg-[#E8E2DA] transition-all duration-300">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-xl font-medium text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors">
                    {post.title}
                  </h2>
                  <time className="text-sm text-[#6B6B6B] shrink-0">
                    {new Date(post.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-[#6B6B6B] mb-4 leading-relaxed">{post.summary}</p>
                {post.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-[#E8E2DA] border border-[#D5CEC7] text-[#6B6B6B]"
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
