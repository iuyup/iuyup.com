'use client';

import { motion, type Variants } from 'framer-motion';
import { projects } from '@/lib/data';

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export function ProjectCard() {
  return (
    <>
      {projects.map((project) => (
        <motion.div key={project.title} variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <a href={project.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center w-full h-full justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
                {project.tag}
              </span>
              <h3 className="text-3xl lg:text-4xl leading-tight text-[#2C2C2C] mb-8 font-serif">
                {project.title}
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-[90%] mb-8">
                {project.desc}
              </p>
              <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Read More
              </span>
            </a>
          </div>
        </motion.div>
      ))}
    </>
  );
}
