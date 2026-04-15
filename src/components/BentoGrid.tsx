'use client';

import { motion, type Variants } from 'framer-motion';
import { AboutCard } from '@/components/cards/AboutCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { AlbumCard } from '@/components/cards/MusicCard';
import { albums, projects } from '@/lib/data';
import { BlogCard, BlogLinkCard } from '@/components/cards/BlogCard';
import { ThemeToggleCard } from '@/components/cards/ThemeToggleCard';
import { FooterCard } from '@/components/cards/FooterCard';
import { GuestbookFlipCard } from '@/components/flip-card/GuestbookFlipCard';
import { ChatFlipCard } from '@/components/flip-card/ChatFlipCard';

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
  image: string | undefined;
}

interface UnifiedItem {
  type: 'post' | 'project' | 'album';
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
  image: string | undefined;
  href?: string;
  desc?: string;
  color?: string;
  cover?: string;
  artist?: string;
}

interface BentoGridProps {
  posts: Post[];
}

export default function BentoGrid({ posts }: BentoGridProps) {
  const topPost = posts[0];
  const restPosts = posts.slice(1);

  const projectItems: UnifiedItem[] = projects.map((p) => ({ ...p, type: 'project', slug: p.href, date: '', summary: p.desc, tags: [p.tag], image: undefined }));
  const albumItems: UnifiedItem[] = albums.map((a) => ({ type: 'album', slug: a.url, title: a.name, date: '', summary: a.artist, tags: ['Music'], image: a.cover, cover: a.cover, artist: a.artist, href: a.url, desc: '', color: '#B8C5C4' }));
  const postItems: UnifiedItem[] = restPosts.map((p) => ({ ...p, type: 'post' }));

  const allItems: UnifiedItem[] = [...postItems, ...projectItems, ...albumItems];

  const col1Items = allItems.filter((_, i) => i % 3 === 0);
  const col2Items = allItems.filter((_, i) => i % 3 === 1);
  const col3Items = allItems.filter((_, i) => i % 3 === 2);

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row gap-8 items-start w-full"
      >
        {/* Column 1: About + fixed items */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <AboutCard />
          {topPost && <BlogCard post={topPost} tag="blog" />}
          <FooterCard />
          {col1Items.map((item) => {
            if (item.type === 'project') return <ProjectCard key={item.slug} project={item as any} />;
            if (item.type === 'album') return <AlbumCard key={item.slug} album={{ cover: item.cover!, url: item.slug, name: item.title, artist: item.artist! }} />;
            return <BlogCard key={item.slug} post={item as Post} tag="blog" />;
          })}
        </div>

        {/* Column 2: Guestbook + fixed items */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <GuestbookFlipCard tag="Guestbook" />
          <ThemeToggleCard />
          {col2Items.map((item) => {
            if (item.type === 'project') return <ProjectCard key={item.slug} project={item as any} />;
            if (item.type === 'album') return <AlbumCard key={item.slug} album={{ cover: item.cover!, url: item.slug, name: item.title, artist: item.artist! }} />;
            return <BlogCard key={item.slug} post={item as Post} tag="blog" />;
          })}
        </div>

        {/* Column 3: Chat + fixed items */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <ChatFlipCard tag="Chat" />
          <BlogLinkCard tag="blog" />
          {col3Items.map((item) => {
            if (item.type === 'project') return <ProjectCard key={item.slug} project={item as any} />;
            if (item.type === 'album') return <AlbumCard key={item.slug} album={{ cover: item.cover!, url: item.slug, name: item.title, artist: item.artist! }} />;
            return <BlogCard key={item.slug} post={item as Post} tag="blog" />;
          })}
        </div>
      </motion.div>
    </section>
  );
}
