'use client';

import { motion, type Variants } from 'framer-motion';

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const hoverSpring = { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };

export function AboutCard() {
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <motion.div
        whileHover={hoverSpring}
        transition={springTransition}
        style={{ boxShadow: 'none' }}
        className={`${cardCls} items-center text-center`}
      >
        <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
          About
        </span>
        <div className="flex flex-col gap-6 w-full">
          <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
            大家好哇，欢迎来到我的网站！
          </p>
          <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
            现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以现在大部分时间都在写 Agent 和拆开源项目的源码。现在在找 AI 开发相关的实习，真的好难找哇。
          </p>
          <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
            喜欢听歌，喜欢 R&B/Neo-soul/Jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）。
          </p>
          <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
            对未来有明确规划，但是保密。
          </p>
        </div>
        <div className="mt-auto pt-6 w-full text-left">
          <p className="text-xs text-[#6B6B6B]">21岁 · 大三在读 · 光电专业</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
