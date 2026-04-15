'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
  image: string | undefined;
}

interface BlogCardProps {
  post: Post;
  tag?: CardVariant;
}

export function BlogCard({ post, tag = 'default' }: BlogCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div
      variants={cardFade}
      className="mb-6 rounded-[2rem] overflow-hidden card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
      style={{ background: variant.bg }}
    >
      <div className="backdrop-blur-2xl rounded-3xl border border-white/60 py-10 px-8 flex flex-col overflow-hidden">
        <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col justify-start gap-4">
          <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm self-center mt-6">
            Blog
          </span>
          <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] font-serif break-words mt-4 text-center">
            {post.title}
          </h3>
          <img src={post.image || "/blog-placeholder.png"} alt="" className="w-full h-auto object-cover rounded-xl mt-4 shadow-md" />
          <time className="text-base mt-4 text-center" style={{ color: variant.textSecondary }}>
            {new Date(post.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
          </time>
          {post.summary && (
            <p className="text-sm mt-3 leading-relaxed text-center" style={{ color: variant.textSecondary }}>
              {post.summary}
            </p>
          )}
          <span className="mt-auto mb-2 border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all self-center">
            Read More
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

interface BlogLinkCardProps {
  tag?: CardVariant;
}

export function BlogLinkCard({ tag = 'default' }: BlogLinkCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div
      variants={cardFade}
      className="rounded-[2rem] overflow-hidden card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
      style={{ background: variant.bg }}
    >
      <div className="backdrop-blur-2xl rounded-3xl border border-white/60 py-10 px-8 min-h-[280px] flex flex-col justify-between">
        <Link href="/posts" className="group flex flex-col h-full justify-between">
          <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm self-center">
            Blog
          </span>
          <div className="my-6">
            <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] font-serif break-words">
              所有文章
            </h3>
            <p className="text-sm mt-2" style={{ color: variant.textSecondary }}>
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
