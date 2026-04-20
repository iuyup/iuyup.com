'use client';

import { AboutCard } from '@/components/cards/AboutCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { AlbumCard } from '@/components/cards/MusicCard';
import { albums, projects } from '@/lib/data';
import { BlogCard, BlogLinkCard } from '@/components/cards/BlogCard';
import { WeatherCard } from '@/components/cards/ThemeToggleCard';
import { GuestbookFlipCard } from '@/components/flip-card/GuestbookFlipCard';
import { ChatFlipCard } from '@/components/flip-card/ChatFlipCard';
import { SocialLinksCard } from '@/components/cards/SocialLinksCard';
import ScrollTiltCard from '@/components/ScrollTiltCard';

const SECOND_WEATHER_CITY = 'New York';

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

  // Build all remaining items and shuffle to mix types
  const allItems: UnifiedItem[] = [...postItems, ...projectItems, ...albumItems];
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
  }

  // Round-robin distribute across 3 columns
  const col1Items = allItems.filter((_, i) => i % 3 === 0);
  const col2Items = allItems.filter((_, i) => i % 3 === 1);
  const col3Items = allItems.filter((_, i) => i % 3 === 2);

  function renderItem(item: UnifiedItem) {
    if (item.type === 'project') {
      return (
        <ScrollTiltCard key={item.slug}>
          <ProjectCard project={item as any} />
        </ScrollTiltCard>
      );
    }
    if (item.type === 'album') {
      return (
        <ScrollTiltCard key={item.slug}>
          <AlbumCard album={{ cover: item.cover!, url: item.slug, name: item.title, artist: item.artist! }} />
        </ScrollTiltCard>
      );
    }
    return (
      <ScrollTiltCard key={item.slug}>
        <BlogCard post={item as Post} tag="blog" />
      </ScrollTiltCard>
    );
  }

  return (
    <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Column 1: About + topPost */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <ScrollTiltCard>
            <AboutCard />
          </ScrollTiltCard>
          {topPost && (
            <ScrollTiltCard>
              <BlogCard post={topPost} tag="blog" />
            </ScrollTiltCard>
          )}
          {col1Items.map(renderItem)}
        </div>

        {/* Column 2: Guestbook + ThemeToggle */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <ScrollTiltCard>
            <GuestbookFlipCard tag="Guestbook" />
          </ScrollTiltCard>
          <ScrollTiltCard>
            <WeatherCard />
          </ScrollTiltCard>
          {col2Items.map(renderItem)}
        </div>

        {/* Column 3: Chat + BlogLinkCard */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <ScrollTiltCard>
            <ChatFlipCard tag="Chat" />
          </ScrollTiltCard>
          <ScrollTiltCard>
            <BlogLinkCard tag="blog" />
          </ScrollTiltCard>
          <ScrollTiltCard>
            <SocialLinksCard />
          </ScrollTiltCard>
          {col3Items.map(renderItem)}
          <ScrollTiltCard>
            <WeatherCard city={SECOND_WEATHER_CITY} />
          </ScrollTiltCard>
        </div>
      </div>
    </section>
  );
}
