'use client';

import { motion, type Variants } from 'framer-motion';
import { AboutCard } from '@/components/cards/AboutCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { MusicCard } from '@/components/cards/MusicCard';
import { BlogCard } from '@/components/cards/BlogCard';
import { ThemeToggleCard } from '@/components/cards/ThemeToggleCard';
import { FooterCard } from '@/components/cards/FooterCard';
import { GuestbookFlipCard } from '@/components/flip-card/GuestbookFlipCard';
import { ChatFlipCard } from '@/components/flip-card/ChatFlipCard';

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
}

interface BentoGridProps {
  posts: Post[];
}

export default function BentoGrid({ posts }: BentoGridProps) {
  return (
    <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
      >
        {/* About */}
        <AboutCard />

        {/* Guestbook — flip card */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }} className="break-inside-avoid mb-6 md:mb-8">
          <GuestbookFlipCard />
        </motion.div>

        {/* Chat with T — flip card */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }} className="break-inside-avoid mb-6 md:mb-8">
          <ChatFlipCard />
        </motion.div>
      </motion.div>

      {/* Masonry layout for remaining cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="columns-1 md:columns-2 lg:columns-3 gap-8 md:gap-10"
      >
        {/* Projects */}
        <ProjectCard />

        {/* Music */}
        <MusicCard />

        {/* Blog posts */}
        <BlogCard posts={posts} />

        {/* Theme Toggle */}
        <ThemeToggleCard />

        {/* Footer */}
        <FooterCard />
      </motion.div>
    </section>
  );
}
