'use client';

import { motion, type Variants } from 'framer-motion';

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export function FooterCard() {
  return (
    <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
      <div className={`${cardCls} items-center text-center`}>
        <span className="font-caveat text-2xl mb-3 text-[#2C2C2C]">T.</span>
        <div className="flex gap-6 font-serif text-sm text-[#6B6B6B]">
          <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C2C2C] transition-colors">
            GitHub
          </a>
          <a href="mailto:tyn2005315@gmail.com" className="hover:text-[#2C2C2C] transition-colors">
            Email
          </a>
        </div>
      </div>
    </motion.div>
  );
}
