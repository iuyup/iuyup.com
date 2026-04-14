'use client';

import { motion, type Variants } from 'framer-motion';
import { projects } from '@/lib/data';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const hoverSpring = { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 25, mass: 0.5 };

interface ProjectCardProps {
  index: number;
}

export function ProjectCard({ index }: ProjectCardProps) {
  const project = projects[index];
  if (!project) return null;

  return (
    <motion.div
      variants={cardFade}
      className="mb-6"
      whileHover={hoverSpring}
      transition={springTransition}
      style={{ boxShadow: 'none' }}
    >
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[320px] flex flex-col justify-between transition-all duration-500 active:scale-[0.98]"
      >
        <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm self-start">
          {project.tag}
        </span>
        <h3 className="text-3xl lg:text-4xl leading-tight text-[#2C2C2C] mb-4 font-serif">
          {project.title}
        </h3>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          {project.desc}
        </p>
        <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all self-start mt-8">
          Read More
        </span>
      </a>
    </motion.div>
  );
}
