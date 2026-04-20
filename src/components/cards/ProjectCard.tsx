'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { projects } from '@/lib/data';
import { projectBg } from '@/lib/colors';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface ProjectData {
  title: string;
  desc: string;
  tag: string;
  color: string;
  href: string;
}

interface ProjectCardProps {
  index?: number;
  project?: ProjectData;
}

export function ProjectCard({ index, project }: ProjectCardProps) {
  const resolved = project ?? projects[index ?? 0];
  const [isHovered, setIsHovered] = useState(false);

  if (!resolved) return null;

  return (
    <motion.div
      className="rounded-3xl border border-white/60 card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
      style={{ background: projectBg(resolved.color) }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <a
        href={resolved.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[430px] flex flex-col justify-between transition-all duration-500 active:scale-[0.98]"
      >
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
            {resolved.tag}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm"
            style={{ transform: 'rotateX(180deg)' }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            {resolved.tag}
          </motion.span>
        </motion.span>
        <h3 className="mt-8 text-3xl lg:text-4xl leading-tight text-[#2C2C2C] font-serif text-center">
          {resolved.title}
        </h3>
        <p className="my-auto text-sm leading-relaxed text-center" style={{ color: '#5a5a5a' }}>
          {resolved.desc}
        </p>
        <span className="border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all self-center">
          Read More
        </span>
      </a>
    </motion.div>
  );
}
