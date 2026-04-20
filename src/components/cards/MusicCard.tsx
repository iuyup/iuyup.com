'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-10 px-8 flex flex-col items-center text-center cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface Album {
  cover: string;
  url: string;
  name: string;
  artist: string;
}

interface AlbumCardProps {
  album: Album;
  tag?: CardVariant;
}

export function AlbumCard({ album, tag = 'default' }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  return (
    <motion.div variants={cardFade} className="break-inside-avoid">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={springTransition}
        style={{ background: variant.bg }}
        className={`${cardCls} card-hover`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.span
          className="relative inline-block mb-6"
          style={{ transformStyle: 'preserve-3d', originX: 0.5, originY: 0.5 }}
          animate={{ rotateX: isHovered ? -180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.span
            className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            Music
          </motion.span>
          <motion.span
            className="absolute inset-0 text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
            style={{ transform: 'rotateX(180deg)' }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            Music
          </motion.span>
        </motion.span>
        <a href={album.url} target="_blank" rel="noopener noreferrer" className="group block w-full">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#E8E2DA] mb-4">
            <img
              src={album.cover}
              alt={album.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
          </div>
        </a>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#2C2C2C]">{album.name}</span>
          <span className="text-xs text-[#6B6B6B]">{album.artist}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
