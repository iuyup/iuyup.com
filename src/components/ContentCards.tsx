"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const projects = [
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
];

export function Projects() {
  return (
    <section id="projects" className="py-24 border-t border-[#D5CEC7]">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">Projects</h2>
        <div className="space-y-6">
          {projects.map((project, i) => (
            <motion.a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}
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
  );
}

const albums = [
  { cover: "/albums/more-life.jpg", url: "https://music.apple.com/cn/album/more-life/1440890708" },
  { cover: "/albums/blond.jpg", url: "https://music.apple.com/cn/album/blonde/1146195596" },
  { cover: "/albums/sos.jpg", url: "https://music.apple.com/cn/album/sos/1657869377" },
  { cover: "/albums/never-enough.jpg", url: "https://music.apple.com/cn/album/never-enough-bonus-version/1681322859" },
];

export function Music() {
  return (
    <section id="music" className="py-24 border-t border-[#D5CEC7]">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-caveat text-4xl mb-8 text-[#6B8DAE]">Music</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {albums.map((album, i) => (
            <motion.a
              key={album.url}
              href={album.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.08 }}
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
    </section>
  );
}
