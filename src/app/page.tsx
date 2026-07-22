import Image from "next/image";
import HeroSection from "@/components/layout/HeroSection";
import BentoGrid from "@/components/BentoGrid";
import { getAllPosts } from "@/lib/posts";
import JsonLd from "@/components/JsonLd";
import monetBackground from "@/assets/monet-background-3840.jpg";

export default function Home() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "T's Site",
    url: "https://iuyup.com",
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {/* Monet Background - Fixed layer with gradient overlay */}
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
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(245,240,235,0.15) 0%, rgba(245,240,235,0.15) 50%, rgba(245,240,235,0.7) 85%, #F5F0EB 100%)' }} />
        </div>

        {/* Hero Content */}
        <HeroSection />

        {/* Bento Grid */}
        <BentoGrid posts={posts} />
      </div>
    </>
  );
}
