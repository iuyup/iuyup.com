import { getAllPosts } from "@/lib/posts";
import BlogPreview from "@/components/blog/BlogPreview";
import Link from "next/link";

export default async function BlogSection() {
  const posts = (await getAllPosts()).slice(0, 2);

  return (
    <section id="blog" className="py-24 border-t border-[#D5CEC7]">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-brand text-4xl mb-8 text-[#6B8DAE]">Blog</h2>
        <BlogPreview posts={posts} />
        <div className="mt-8">
          <Link href="/posts" className="text-sm text-[#6B8DAE] hover:underline transition-colors">
            查看全部博客 →
          </Link>
        </div>
      </div>
    </section>
  );
}
