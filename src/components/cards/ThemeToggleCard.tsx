'use client';

import { motion, type Variants } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export function ThemeToggleCard() {
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <div className={`${cardCls} items-center text-center`}>
        <ThemeToggle />
        <span className="text-sm text-[#6B6B6B] mt-3 font-serif">切换主题</span>
      </div>
    </motion.div>
  );
}
