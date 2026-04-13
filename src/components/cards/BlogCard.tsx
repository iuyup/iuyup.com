'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
}

interface BlogCardProps {
  posts: Post[];
}

export function BlogCard({ posts }: BlogCardProps) {
  return (
    <>
      {posts.slice(0, 2).map((post) => (
        <motion.div key={post.slug} variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col items-center text-center w-full h-full justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
                Article
              </span>
              <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] mb-4 font-serif break-words">
                {post.title}
              </h3>
              <time className="text-xs text-[#6B6B6B] mb-4">
                {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
              <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-[90%] mb-6">
                {post.summary}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap justify-center mb-8">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full border text-[#6B6B6B]" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Read More
              </span>
            </Link>
          </div>
        </motion.div>
      ))}
    </>
  );
}
