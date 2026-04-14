'use client';

import { motion, type Variants } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/30 py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const hoverSpring = { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };

interface AboutCardProps {
  tag?: CardVariant;
}

export function AboutCard({ tag = 'default' }: AboutCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <motion.div
        whileHover={hoverSpring}
        transition={springTransition}
        style={{ boxShadow: 'none', background: variant.bg }}
        className={`${cardCls} items-center text-center`}
      >
        <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
          About
        </span>
        <div className="flex flex-col gap-6 w-full">
          <p className="text-base leading-[1.8] whitespace-normal text-left" style={{ color: variant.textSecondary }}>
            大家好哇，欢迎来到我的网站！
          </p>
          <p className="text-base leading-[1.8] whitespace-normal text-left" style={{ color: variant.textSecondary }}>
            现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以现在大部分时间都在写 Agent 和拆开源项目的源码。现在在找 AI 开发相关的实习，真的好难找哇。
          </p>
          <p className="text-base leading-[1.8] whitespace-normal text-left" style={{ color: variant.textSecondary }}>
            喜欢听歌，喜欢 R&B/Neo-soul/Jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）。
          </p>
          <p className="text-base leading-[1.8] whitespace-normal text-left" style={{ color: variant.textSecondary }}>
            对未来有明确规划，但是保密。
          </p>
        </div>
        <div className="mt-auto pt-6 w-full text-left">
          <p className="text-xs" style={{ color: variant.textSecondary }}>Think in decades, act in days.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
