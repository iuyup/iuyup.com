"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
}

interface BlogPreviewProps {
  posts: Post[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogPreview({ posts }: BlogPreviewProps) {
  return (
    <div className="space-y-6">
      {posts.map((post, i) => (
        <motion.div
          key={post.slug}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}
        >
          <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="block group">
            <div className="p-6 rounded-xl bg-[#E8E2DA] border border-[#D5CEC7] hover:bg-[#f0ebe3] transition-all duration-300">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-medium text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors duration-300">
                  {post.title}
                </h3>
                <time className="text-sm shrink-0 text-[#6B6B6B]">
                  {new Date(post.date).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
                {post.summary}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full border text-[#6B6B6B]"
                      style={{ borderColor: '#D5CEC7' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
