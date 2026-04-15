'use client';

import { motion, type Variants } from 'framer-motion';
import { projects } from '@/lib/data';
import { projectBg } from '@/lib/colors';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface ProjectCardProps {
  index: number;
}

export function ProjectCard({ index }: ProjectCardProps) {
  const project = projects[index];
  if (!project) return null;

  return (
    <motion.div
      variants={cardFade}
      className="mb-6 rounded-3xl border border-white/60 card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
      style={{ background: projectBg(project.color) }}
    >
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[430px] flex flex-col justify-between transition-all duration-500 active:scale-[0.98]"
      >
        <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm self-center">
          {project.tag}
        </span>
        <h3 className="mt-8 text-3xl lg:text-4xl leading-tight text-[#2C2C2C] font-serif text-center">
          {project.title}
        </h3>
        <p className="my-auto text-sm leading-relaxed text-center" style={{ color: '#5a5a5a' }}>
          {project.desc}
        </p>
        <span className="border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all self-center">
          Read More
        </span>
      </a>
    </motion.div>
  );
}
