import HeroSection from "@/components/layout/HeroSection";
import BentoGrid from "@/components/BentoGrid";
import { getAllPosts } from "@/lib/posts";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Monet Background - Fixed layer with gradient overlay */}
      <div className="fixed inset-0 z-0">
        <img src="/monet.jpg" alt="" className="w-full h-full object-cover" style={{ filter: 'saturate(0.5)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(245,240,235,0.3) 0%, rgba(245,240,235,0.3) 60%, rgba(245,240,235,0.85) 85%, #F5F0EB 100%)' }} />
      </div>

      {/* Hero Content */}
      <HeroSection />

      {/* Bento Grid */}
      <BentoGrid posts={posts} />
    </div>
    </>
  );
}
