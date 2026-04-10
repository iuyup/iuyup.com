"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#2C2C2C] selection:bg-[#D4856A]/30">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F0EB]/80 backdrop-blur-sm border-b border-[#D5CEC7]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-caveat text-xl text-[#2C2C2C]">T.</span>
          <div className="flex gap-6 text-sm text-[#6B6B6B]">
            <a href="#about" className="hover:text-[#2C2C2C] transition-colors duration-300">About</a>
            <a href="#projects" className="hover:text-[#2C2C2C] transition-colors duration-300">Projects</a>
            <a href="#music" className="hover:text-[#2C2C2C] transition-colors duration-300">Music</a>
            <Link href="/posts" className="hover:text-[#2C2C2C] transition-colors duration-300">Blog</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center max-w-3xl mx-auto px-6">
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
            对 AI Agent、开源和长期主义感兴趣。正在探索芯片与能源的交叉地带，
            相信技术应该为人服务。
          </p>

          {/* Scroll hint */}
          <div className="pt-12">
            <svg width="24" height="36" viewBox="0 0 24 36" className="opacity-40">
              <rect x="1" y="1" width="22" height="34" rx="11" stroke="#6B6B6B" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="10" r="2.5" fill="#6B6B6B" />
            </svg>
          </div>
        </div>
      </section>

      {/* About */}
      <motion.section
        id="about"
        className="py-24 border-t border-[#D5CEC7]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        variants={sectionVariants}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">About</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4 text-[#6B6B6B] leading-relaxed">
              <p>
                21 岁，大三在读。专业是光电，但大部分时间都在写 Agent 和拆开源项目的源码。
              </p>
              <p>
                信奉「先做出来再说」—— 与其花三个月学理论，不如花三天跑通一个项目，再回头补知识。
              </p>
            </div>
            <div className="space-y-4 text-[#6B6B6B] leading-relaxed">
              <p>
                长期关注 AI → 算力 → 芯片 → 能源 这条主线。在构建一个跨越十年的认知复利系统。
              </p>
              <p>
                喜欢《黑镜》，喜欢思考技术与人的关系。
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Projects */}
      <section id="projects" className="py-24 border-t border-[#D5CEC7]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            className="font-caveat text-4xl mb-8 text-[#6B8DAE]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            variants={sectionVariants}
          >
            Projects
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                title: "AgentFlow",
                desc: "10+ 种多智能体设计模式，基于 LangGraph 构建",
                tag: "Open Source",
                color: "#6B8DAE",
                href: "https://github.com/iuyup/AgentFlow",
              },
              {
                title: "Auto-Tweet Agent",
                desc: "LangGraph StateGraph 驱动的 10+ 节点多智能体系统，自动发布推文",
                tag: "Agent",
                color: "#D4856A",
                href: "https://github.com/iuyup/News-Tweet-Agent",
              },
              {
                title: "RAG 2.0",
                desc: "混合 FAISS+BM25 检索，RRF 融合 + BGE-Reranker 二阶段重排",
                tag: "Retrieval",
                color: "#B8C5C4",
                href: "https://github.com/iuyup/Enterprise-Rag-Agent",
              },
            ].map((project, i) => (
              <motion.a
                key={project.title}
                href={project.href}
                target={project.href.startsWith("http") ? "_blank" : undefined}
                rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: i * 0.1,
                }}
                variants={fadeInUp}
              >
                <div className="p-6 rounded-xl bg-[#E8E2DA] border border-[#D5CEC7] hover:bg-[#f0ebe3] transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-[#6B6B6B] mt-1">{project.desc}</p>
                    </div>
                    <span
                      className="shrink-0 text-xs px-3 py-1 rounded-full border"
                      style={{ color: project.color, borderColor: project.color + "40" }}
                    >
                      {project.tag}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Music */}
      <motion.section
        id="music"
        className="py-24 border-t border-[#D5CEC7]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        variants={sectionVariants}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">Music</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                cover: "/albums/more-life.jpg",
                url: "https://music.apple.com/cn/album/more-life/1440890708",
              },
              {
                cover: "/albums/blond.jpg",
                url: "https://music.apple.com/cn/album/blonde/1146195596",
              },
              {
                cover: "/albums/sos.jpg",
                url: "https://music.apple.com/cn/album/sos/1657869377",
              },
              {
                cover: "/albums/never-enough.jpg",
                url: "https://music.apple.com/cn/album/never-enough-bonus-version/1681322859",
              },
            ].map((album, i) => (
              <motion.a
                key={album.url}
                href={album.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: i * 0.08,
                }}
                variants={fadeInUp}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-[#E8E2DA] border border-[#D5CEC7]">
                  <img
                    src={album.cover}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.section>

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
