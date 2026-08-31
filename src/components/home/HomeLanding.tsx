import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import HeroSection from "@/components/layout/HeroSection";
import BentoGrid from "@/components/BentoGrid";
import ReadingProgress from "@/components/journal/ReadingProgress";
import monetBackground from "@/assets/monet-background-3840.jpg";
import type { ContentItem } from "@/lib/content";
import type { HomeLocale } from "@/lib/home-content";

interface HomeLandingProps {
  locale: HomeLocale;
  posts: ContentItem[];
  jsonLd: Record<string, unknown>;
}

export default function HomeLanding({ locale, posts, jsonLd }: HomeLandingProps) {
  const isEnglish = locale === "en";

  return (
    <div lang={locale}>
      <JsonLd data={jsonLd} />
      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div className="fixed inset-0 z-0">
          <Image
            src={monetBackground}
            alt=""
            fill
            preload
            sizes="100vw"
            quality={75}
            className="object-cover"
            style={{ filter: "saturate(0.7)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(245,240,235,0.15) 0%, rgba(245,240,235,0.15) 50%, rgba(245,240,235,0.7) 85%, #F5F0EB 100%)",
            }}
          />
        </div>

        <HeroSection />
        <BentoGrid locale={locale} posts={posts} />
        <ReadingProgress ariaLabel={isEnglish ? "Back to the top" : undefined} />
      </div>
    </div>
  );
}
