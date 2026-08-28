'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';
import type { HomeLocale } from '@/lib/home-content';

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
  locale?: HomeLocale;
}

export function BlogCard({ post, tag = 'default', locale = 'zh-CN' }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const isEnglish = locale === 'en';
  return (
    <motion.div
      className="mb-6 rounded-[2rem] overflow-hidden card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
      style={{ background: variant.bg }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="backdrop-blur-2xl rounded-3xl border border-white/60 py-10 px-8 flex flex-col overflow-hidden">
        <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col justify-start gap-4">
          <motion.span
            className="relative inline-block self-center mt-6"
            style={{ transformStyle: 'preserve-3d', originX: 0.5, originY: 0.5 }}
            animate={{ rotateX: isHovered ? -180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.span
              className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            >
              Blog
            </motion.span>
            <motion.span
              className="absolute inset-0 text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
              style={{ transform: 'rotateX(180deg)' }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              Blog
            </motion.span>
          </motion.span>
          <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] font-serif break-words mt-4 text-center">
            {post.title}
          </h3>
          <img
            src={post.image || "/blog-placeholder.svg"}
            alt={isEnglish ? `Cover image for “${post.title}”` : `${post.title} 的封面图`}
            className="w-full h-auto object-cover rounded-xl mt-4 shadow-md"
          />
          <time className="text-base mt-4 text-center" style={{ color: variant.textSecondary }}>
            {new Date(post.date).toLocaleDateString(isEnglish ? 'en-US' : 'zh-CN', {
              month: isEnglish ? 'short' : '2-digit',
              day: '2-digit',
              timeZone: 'UTC',
            })}
          </time>
          {post.summary && (
            <p className="text-sm mt-3 leading-relaxed text-center" style={{ color: variant.textSecondary }}>
              {post.summary}
            </p>
          )}
          <span className="mt-auto mb-2 border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all self-center">
            {isEnglish ? 'Read in Chinese' : 'Read More'}
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

interface JournalLinkCardProps {
  tag?: CardVariant;
  href: string;
  label: string;
  title: string;
  description: string;
  action: string;
}

function JournalLinkCard({ tag = 'default', href, label, title, description, action }: JournalLinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div
      className="rounded-[2rem] overflow-hidden card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
      style={{ background: variant.bg }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="backdrop-blur-2xl rounded-3xl border border-white/60 py-10 px-8 min-h-[280px] flex flex-col justify-between">
        <Link href={href} className="group flex flex-col h-full justify-between">
          <motion.span
            className="relative inline-block self-center"
            style={{ transformStyle: 'preserve-3d', originX: 0.5, originY: 0.5 }}
            animate={{ rotateX: isHovered ? -180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.span
              className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.span>
            <motion.span
              className="absolute inset-0 text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
              style={{ transform: 'rotateX(180deg)' }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.span>
          </motion.span>
          <div className="my-6">
            <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] font-serif break-words">
              {title}
            </h3>
            <p className="text-sm mt-2" style={{ color: variant.textSecondary }}>
              {description}
            </p>
          </div>
          <span className="border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all inline-block mt-auto">
            {action}
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

interface LocalizedJournalLinkCardProps extends Pick<JournalLinkCardProps, 'tag'> {
  locale?: HomeLocale;
}

export function BlogLinkCard({ tag = 'default', locale = 'zh-CN' }: LocalizedJournalLinkCardProps) {
  const isEnglish = locale === 'en';

  return (
    <JournalLinkCard
      tag={tag}
      href="/posts"
      label="Blog"
      title={isEnglish ? 'Writing' : '文章'}
      description={isEnglish ? 'Notes on AI agents, open source, and engineering.' : '关于 AI Agent、开源与技术思考'}
      action={isEnglish ? 'Read the Chinese blog' : 'View All'}
    />
  );
}

export function NoteLinkCard({ tag = 'default', locale = 'zh-CN' }: LocalizedJournalLinkCardProps) {
  const isEnglish = locale === 'en';

  return (
    <JournalLinkCard
      tag={tag}
      href="/notes"
      label="Notes"
      title={isEnglish ? 'Field Notes' : '随心'}
      description={isEnglish ? 'Short notes, loose thoughts, and fragments without a fixed theme.' : '一些没有固定主题的记录、想法与片段'}
      action={isEnglish ? 'Read Chinese notes' : 'View Notes'}
    />
  );
}
