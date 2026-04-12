"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import FadeIn from "@/components/FadeIn";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F5F0EB]/80 backdrop-blur-md border-b border-[#D5CEC7] shadow-sm"
            : "bg-transparent border-b-0"
        }`}
        style={{ background: scrolled ? undefined : 'transparent', borderColor: scrolled ? '#D5CEC7' : 'transparent' }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-caveat text-xl leading-none" style={{ color: 'var(--text)' }}>T.</span>
          <div className="flex gap-5 text-sm items-center self-center" style={{ color: 'var(--text-secondary)' }}>
            <a href="#about" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>About</a>
            <a href="#projects" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>Projects</a>
            <a href="#music" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>Music</a>
            <Link href="/posts" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>Blog</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

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

          {/* Scroll hint */}
          <motion.div style={{ opacity: scrollHintOpacity }} className="pt-12">
            <svg width="24" height="36" viewBox="0 0 24 36" className="opacity-40">
              <rect x="1" y="1" width="22" height="34" rx="11" stroke="#6B6B6B" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="10" r="2.5" fill="#6B6B6B" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Main content wrapper - card style over Monet */}
      <div className="relative z-10 bg-[#F5F0EB] w-full max-w-4xl mx-auto rounded-t-2xl rounded-b-2xl border-t border-[#D5CEC7]"><section id="about" className="py-24"><div className="max-w-3xl mx-auto px-6"><h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">About</h2><div className="grid sm:grid-cols-2 gap-8"><div className="space-y-4 text-[#6B6B6B] leading-relaxed"><p>大家好哇，欢迎来到我的网站！</p><p>现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以现在大部分时间都在写 Agent 和拆开源项目的源码。</p><p>现在在找 AI 开发相关的实习，真的好难找哇。</p></div><div className="space-y-4 text-[#6B6B6B] leading-relaxed"><p>喜欢听歌，喜欢 rnb、 喜欢 neosoul、喜欢jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）</p><p>对未来有明确规划，但是保密。</p></div></div></div></section><section id="projects" className="py-24 border-t border-[#D5CEC7]"><div className="max-w-3xl mx-auto px-6"><h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">Projects</h2><div className="space-y-6">{[{title:"AgentFlow",desc:"10+ 种多智能体设计模式，基于 LangGraph 构建",tag:"Open Source",color:"#6B8DAE",href:"https://github.com/iuyup/AgentFlow"},{title:"Auto-Tweet Agent",desc:"LangGraph StateGraph 驱动的 10+ 节点多智能体系统，自动发布推文",tag:"Agent",color:"#D4856A",href:"https://github.com/iuyup/News-Tweet-Agent"},{title:"RAG 2.0",desc:"混合 FAISS+BM25 检索，RRF 融合 + BGE-Reranker 二阶段重排",tag:"Retrieval",color:"#B8C5C4",href:"https://github.com/iuyup/Enterprise-Rag-Agent"}].map((project, i) => (<motion.a key={project.title} href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block group" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}><div className="p-6 rounded-xl bg-[#E8E2DA] border border-[#D5CEC7] hover:bg-[#f0ebe3] transition-all duration-300"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-medium text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors duration-300">{project.title}</h3><p className="text-sm text-[#6B6B6B] mt-1">{project.desc}</p></div><span className="shrink-0 text-xs px-3 py-1 rounded-full border" style={{ color: project.color, borderColor: project.color + "40" }}>{project.tag}</span></div></div></motion.a>))}</div></div></section><section id="music" className="py-24 border-t border-[#D5CEC7]"><div className="max-w-3xl mx-auto px-6"><h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">Music</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[{cover:"/albums/more-life.jpg",url:"https://music.apple.com/cn/album/more-life/1440890708"},{cover:"/albums/blond.jpg",url:"https://music.apple.com/cn/album/blonde/1146195596"},{cover:"/albums/sos.jpg",url:"https://music.apple.com/cn/album/sos/1657869377"},{cover:"/albums/never-enough.jpg",url:"https://music.apple.com/cn/album/never-enough-bonus-version/1681322859"}].map((album, i) => (<motion.a key={album.url} href={album.url} target="_blank" rel="noopener noreferrer" className="group block" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.08 }} variants={fadeInUp}><div className="aspect-square rounded-lg overflow-hidden bg-[#E8E2DA] border border-[#D5CEC7]"><img src={album.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div></motion.a>))}</div></div></section><section id="blog" className="py-24 border-t border-[#D5CEC7]"><div className="max-w-3xl mx-auto px-6"><h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">Blog</h2><div className="space-y-6">{[{title:"使用 LangGraph 构建多智能体系统",date:"2026-04-08",summary:"本文记录了我使用 LangGraph 构建 AgentFlow 项目的过程，探讨了多智能体系统的设计模式与实践经验。",tags:["AI Agent","LangGraph","Python"],slug:"building-agent-flow"},{title:"知乎掘金 | Claude Managed Agents 深度解读",date:"2026-04-05",summary:"深入分析 Claude 的 Managed Agents 架构，探讨其在复杂任务处理中的优势与局限性。",tags:["Claude","AI Agent"],slug:"知乎掘金_Claude_Managed_Agents深度解读"}].map((post, i) => (<motion.div key={post.slug} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}><Link href={`/posts/${encodeURIComponent(post.slug)}`} className="block group"><div className="p-6 rounded-xl bg-[#E8E2DA] border border-[#D5CEC7] hover:bg-[#f0ebe3] transition-all duration-300"><div className="flex items-start justify-between gap-4 mb-3"><h3 className="text-lg font-medium text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors duration-300">{post.title}</h3><time className="text-sm shrink-0 text-[#6B6B6B]">{new Date(post.date).toLocaleDateString("zh-CN",{year:"numeric",month:"short",day:"numeric"})}</time></div><p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{post.summary}</p>{post.tags && post.tags.length > 0 && (<div className="flex gap-2 flex-wrap">{post.tags.map((tag) => (<span key={tag} className="text-xs px-2 py-1 rounded-full border text-[#6B6B6B]" style={{ borderColor: '#D5CEC7' }}>{tag}</span>))}</div>)}</div></Link></motion.div>))}</div><div className="mt-8"><Link href="/posts" className="text-sm text-[#6B8DAE] hover:underline transition-colors">查看全部博客 →</Link></div></div></section></div>

      {/* Footer */}
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
