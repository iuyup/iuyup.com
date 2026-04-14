'use client';

import { motion, type Variants } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const hoverSpring = { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };

interface ThemeToggleCardProps {
  tag?: CardVariant;
}

export function ThemeToggleCard({ tag = 'default' }: ThemeToggleCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <motion.div
        whileHover={hoverSpring}
        transition={springTransition}
        style={{ boxShadow: 'none', background: variant.bg }}
        className={`${cardCls} items-center text-center`}
      >
        <ThemeToggle />
        <span className="text-sm mt-3 font-serif" style={{ color: variant.textSecondary }}>切换主题</span>
      </motion.div>
    </motion.div>
  );
}
