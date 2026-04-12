import Nav from "@/components/Nav";
import ScrollHint from "@/components/ScrollHint";
import BlogSection from "@/components/BlogSection";
import { Projects, Music } from "@/components/ContentCards";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* Monet Background - Fixed layer */}
      <div className="fixed inset-0 z-0">
        <img src="/monet.jpg" alt="" className="w-full h-full object-cover" style={{ filter: 'saturate(0.5)', opacity: 0.6 }} />
      </div>

      {/* Hero Content */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center max-w-3xl mx-auto px-6">
        <div className="space-y-6">
          {/* Hand-drawn decorative element */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-60">
            <circle cx="24" cy="24" r="20" stroke="#D4856A" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
            <circle cx="24" cy="24" r="8" fill="#D4856A" opacity="0.4" />
            <path d="M24 4 C26 14, 34 22, 44 24 C34 26, 26 34, 24 44 C22 34, 14 26, 4 24 C14 22, 22 14, 24 4Z" stroke="#D4856A" strokeWidth="1.5" fill="none" opacity="0.3" />
          </svg>

          <h1 className="font-caveat text-6xl sm:text-7xl leading-tight">
            Hey, I&apos;m <span className="text-[#6B8DAE]">T</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#6B6B6B] max-w-xl leading-relaxed">
            汕头大学 · 光电信息科学与工程
          </p>
          <p className="text-base text-[#6B6B6B] max-w-xl leading-relaxed">
            对 AI Agent、开源和长期主义感兴趣。正在学习 AI Agent并且不断跟踪 AI 前沿，
            喜欢音乐。
          </p>

          <ScrollHint />
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
                <p>喜欢听歌，喜欢 rnb、 喜欢 neosoul、喜欢jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）</p>
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
          <div className="flex gap-4">
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
