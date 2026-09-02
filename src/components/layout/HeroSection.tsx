'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-screen text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-brand text-6xl md:text-8xl leading-tight"
      >
        Hey, I&apos;m <span className="text-[#6B8DAE]" style={{ textShadow: '0 1px 0 #F5F0EB, 0 2px 8px rgba(0,0,0,0.15)' }}>T</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#6B6B6B]"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="animate-bounce">
          <path d="M8 2v12M2 8l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </section>
  );
}
