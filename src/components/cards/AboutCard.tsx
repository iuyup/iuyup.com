'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';
import type { HomeLocale } from '@/lib/home-content';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface AboutCardProps {
  tag?: CardVariant;
  locale?: HomeLocale;
}

const aboutCopy: Record<HomeLocale, { ariaLabel: string; paragraphs: string[] }> = {
  'zh-CN': {
    ariaLabel: '查看关于 iuyup 的详细介绍',
    paragraphs: [
      '大家好哇，欢迎来到我的网站！',
      '现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以大部分时间都在写 Agent 和拆开源项目的源码。现在在做 AI 开发相关的实习。',
      '喜欢听歌，喜欢 R&B/Neo-soul/Jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）。',
      '对未来有明确规划。',
    ],
  },
  en: {
    ariaLabel: 'Learn more about iuyup',
    paragraphs: [
      'Hey—welcome to my corner of the internet.',
      "I'm 21 and in my third year at Shantou University, studying optoelectronics. AI has pulled me in more strongly, so I spend most of my time building agents and reading open-source code. I'm currently interning in AI development.",
      "I'm into R&B, neo-soul, and jazz—especially David Tao, Leehom Wang, Khalil Fong, and YELLOW. I also play guitar in a band. And, despite appearances, I'm not an anime fan.",
      'I know where I want to go next.',
    ],
  },
};

export function AboutCard({ tag = 'default', locale = 'zh-CN' }: AboutCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const copy = aboutCopy[locale];
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <Link
        href="/about"
        aria-label={copy.ariaLabel}
        className="block rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={springTransition}
          style={{ background: variant.bg }}
          className={`${cardCls} items-center text-center card-hover`}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
        <motion.span
          className="relative inline-block mb-8"
          style={{ transformStyle: 'preserve-3d', originX: 0.5, originY: 0.5 }}
          animate={{ rotateX: isHovered ? -180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.span
            className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            About
          </motion.span>
          <motion.span
            className="absolute inset-0 text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
            style={{ transform: 'rotateX(180deg)' }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            About
          </motion.span>
        </motion.span>
        <div className="flex flex-col gap-6 w-full">
          {copy.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="type-summary text-base whitespace-normal text-left"
              style={{ color: variant.textSecondary }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-auto pt-6 w-full text-left">
          <p className="font-interface text-xs" style={{ color: variant.textSecondary }}>Think in decades, act in days.</p>
        </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
