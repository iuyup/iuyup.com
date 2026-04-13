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
      {/* True masonry with 3 physical columns */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row gap-8 items-start w-full"
      >
        {/* Column 1: About + items at index 1, 4, 7... */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <AboutCard />
          <ProjectCard index={0} />
          {posts[0] && <BlogCard post={posts[0]} />}
          <FooterCard />
        </div>

        {/* Column 2: Guestbook + items at index 2, 5, 8... */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <GuestbookFlipCard />
          <ProjectCard index={1} />
          <ThemeToggleCard />
        </div>

        {/* Column 3: Chat + items at index 3, 6, 9... */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <ChatFlipCard />
          <ProjectCard index={2} />
          <MusicCard />
          {posts[1] && <BlogCard post={posts[1]} />}
        </div>
      </motion.div>
    </section>
  );
}
