import Nav from "@/components/Nav";
import BlogSection from "@/components/BlogSection";
import { Projects, Music } from "@/components/ContentCards";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* Monet Background - Fixed layer with gradient overlay */}
      <div className="fixed inset-0 z-0">
        <img src="/monet.jpg" alt="" className="w-full h-full object-cover" style={{ filter: 'saturate(0.5)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(245,240,235,0.3) 0%, rgba(245,240,235,0.3) 60%, rgba(245,240,235,0.85) 85%, #F5F0EB 100%)' }} />
      </div>

      {/* Hero Content */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="space-y-6">
          <h1 className="font-caveat text-6xl md:text-8xl leading-tight">
            Hey, I&apos;m <span className="text-[#6B8DAE]">T</span>
          </h1>
          <p className="text-lg text-[#2C2C2C]">
            汕头大学 · 光电信息科学与工程
          </p>

          <div className="flex justify-center items-center gap-4 pt-4">
            <a href="#projects" className="min-w-[180px] text-center bg-[#6B8DAE] text-white rounded-lg px-8 py-3.5 tracking-wider text-sm font-medium font-serif hover:opacity-80 transition-opacity">
              View Projects
            </a>
            <Link href="/posts" className="min-w-[180px] text-center bg-transparent border-2 border-[#6B6B6B]/40 text-[#2C2C2C] rounded-lg px-8 py-3.5 tracking-wider text-sm font-medium font-serif hover:border-[#6B8DAE] transition-colors">
              Read Blog
            </Link>
          </div>

          <div className="mt-22 flex justify-center text-[#6B6B6B]">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="animate-bounce">
              <path d="M8 2v12M2 8l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Main content wrapper - card style over Monet */}
      <div className="relative z-10 bg-[#F5F0EB] w-full max-w-4xl mx-auto rounded-t-2xl rounded-b-2xl border-t border-[#D5CEC7]">
        <section id="about" className="py-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">About</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4 text-[#6B6B6B] leading-relaxed">
                <p>大家好哇，欢迎来到我的网站！</p>
                <p>现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以现在大部分时间都在写 Agent 和拆开源项目的源码。</p>
                <p>现在在找 AI 开发相关的实习，真的好难找哇。</p>
              </div>
              <div className="space-y-4 text-[#6B6B6B] leading-relaxed">
                <p>喜欢听歌，喜欢 R&B/Neo-soul/Jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）</p>
                <p>对未来有明确规划，但是保密。</p>
              </div>
            </div>
          </div>
        </section>
        <Projects />
        <Music />
        <BlogSection />
      </div>

      <footer className="py-12 border-t border-[#D5CEC7]">
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center text-sm text-[#6B6B6B]">
          <span className="font-caveat text-base">T.</span>
          <div className="flex gap-4 font-serif">
            <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C2C2C] transition-colors duration-300">
              GitHub
            </a>
            <a href="mailto:tyn2005315@gmail.com" className="hover:text-[#2C2C2C] transition-colors duration-300">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
