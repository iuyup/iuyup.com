'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const hoverSpring = { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
}

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.div
      variants={cardFade}
      className="mb-6"
      whileHover={hoverSpring}
      transition={springTransition}
      style={{ boxShadow: 'none' }}
    >
      <div className="bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-10 px-8 min-h-[280px] flex flex-col justify-between">
        <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col h-full justify-between">
          <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm self-start">
            Blog
          </span>
          <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] font-serif break-words my-6">
            {post.title}
          </h3>
          <div className="mt-auto">
            <time className="text-xs text-[#6B6B6B] block mb-3">
              {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full border text-[#6B6B6B]" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <span className="border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all inline-block">
              Read More
            </span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export function BlogLinkCard() {
  return (
    <motion.div
      variants={cardFade}
      whileHover={hoverSpring}
      transition={springTransition}
      style={{ boxShadow: 'none' }}
    >
      <div className="bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-10 px-8 min-h-[280px] flex flex-col justify-between">
        <Link href="/posts" className="group flex flex-col h-full justify-between">
          <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm self-start">
            Blog
          </span>
          <div className="my-6">
            <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] font-serif break-words">
              所有文章
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-2">
              关于 AI Agent、开源与技术思考
            </p>
          </div>
          <span className="border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all inline-block mt-auto">
            View All
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
