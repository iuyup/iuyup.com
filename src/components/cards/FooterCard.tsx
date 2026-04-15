'use client';

import { motion, type Variants } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const hoverSpring = { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface FooterCardProps {
  tag?: CardVariant;
}

export function FooterCard({ tag = 'default' }: FooterCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <motion.div
        initial={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        animate={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        whileHover={hoverSpring}
        transition={springTransition}
        style={{ background: variant.bg }}
        className={`${cardCls} items-center text-center`}
      >
        <span className="font-caveat text-2xl mb-3 text-[#2C2C2C]">T.</span>
        <div className="flex gap-6 font-serif text-sm">
          <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C2C2C] transition-colors" style={{ color: variant.textSecondary }}>
            GitHub
          </a>
          <a href="mailto:tyn2005315@gmail.com" className="hover:text-[#2C2C2C] transition-colors" style={{ color: variant.textSecondary }}>
            Email
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
