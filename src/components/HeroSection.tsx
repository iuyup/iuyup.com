'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="font-caveat text-6xl md:text-8xl leading-tight"
        >
          Hey, I&apos;m <span className="text-[#6B8DAE]">T</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="text-lg text-[#2C2C2C]"
        >
          汕头大学 · 光电信息科学与工程
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          className="flex justify-center items-center gap-4 pt-4"
        >
          <a href="#projects" className="min-w-[180px] text-center bg-[#6B8DAE] text-white rounded-lg px-8 py-3.5 tracking-wider text-sm font-medium font-serif hover:opacity-80 transition-opacity">
            View Projects
          </a>
          <Link href="/posts" className="min-w-[180px] text-center bg-transparent border-2 border-[#6B6B6B]/40 text-[#2C2C2C] rounded-lg px-8 py-3.5 tracking-wider text-sm font-medium font-serif hover:border-[#6B8DAE] transition-colors">
            Read Blog
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="mt-22 flex justify-center text-[#6B6B6B]"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="animate-bounce">
            <path d="M8 2v12M2 8l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
