'use client';

import { motion, type Variants } from 'framer-motion';
import { albums } from '@/lib/data';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface MusicCardProps {
  tag?: CardVariant;
}

export function MusicCard({ tag = 'default' }: MusicCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={springTransition}
        style={{ background: variant.bg }}
        className={`${cardCls} items-center text-center card-hover`}
      >
        <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
          Music
        </span>
        <div className="flex flex-col gap-4 w-full">
          <a href={albums[0].url} target="_blank" rel="noopener noreferrer" className="group block w-full">
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-[#E8E2DA]">
              <img
                src={albums[0].cover}
                alt=""
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            </div>
          </a>
          <div className="flex gap-3">
            {albums.slice(1).map((album) => (
              <a
                key={album.url}
                href={album.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block flex-1"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#E8E2DA]">
                  <img
                    src={album.cover}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
