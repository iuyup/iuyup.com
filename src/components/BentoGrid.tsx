'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const projects = [
  {
    title: 'AgentFlow',
    desc: '10+ 种多智能体设计模式，基于 LangGraph 构建',
    tag: 'Open Source',
    color: '#6B8DAE',
    href: 'https://github.com/iuyup/AgentFlow',
  },
  {
    title: 'Auto-Tweet Agent',
    desc: 'LangGraph StateGraph 驱动的 7 节点多智能体系统，自动发布推文',
    tag: 'Agent',
    color: '#D4856A',
    href: 'https://github.com/iuyup/News-Tweet-Agent',
  },
  {
    title: 'RAG 2.0',
    desc: '混合 FAISS+BM25 检索，RRF 融合 + BGE-Reranker 二阶段重排',
    tag: 'Retrieval',
    color: '#B8C5C4',
    href: 'https://github.com/iuyup/Enterprise-Rag-Agent',
  },
];

const albums = [
  { cover: '/albums/more-life.jpg', url: 'https://music.apple.com/cn/album/more-life/1440890708' },
  { cover: '/albums/blond.jpg', url: 'https://music.apple.com/cn/album/blonde/1146195596' },
  { cover: '/albums/sos.jpg', url: 'https://music.apple.com/cn/album/sos/1657869377' },
  { cover: '/albums/never-enough.jpg', url: 'https://music.apple.com/cn/album/never-enough-bonus-version/1681322859' },
];

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string | undefined;
  tags: string[] | undefined;
}

interface BentoGridProps {
  posts: Post[];
}

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-3xl p-10 md:p-12 cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]';

export default function BentoGrid({ posts }: BentoGridProps) {
  const openChat = () => {
    window.dispatchEvent(new CustomEvent('chat:open'));
  };

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* About — full width */}
        <motion.div variants={cardFade} className="md:col-span-2">
          <div className={`${cardCls} p-8 md:p-10`}>
            <h2 className="font-caveat text-4xl text-[#6B8DAE] mb-6">About</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3 text-[#6B6B6B] leading-relaxed">
                <p>大家好哇，欢迎来到我的网站！</p>
                <p>现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以现在大部分时间都在写 Agent 和拆开源项目的源码。</p>
                <p>现在在找 AI 开发相关的实习，真的好难找哇。</p>
              </div>
              <div className="space-y-3 text-[#6B6B6B] leading-relaxed">
                <p>喜欢听歌，喜欢 R&B/Neo-soul/Jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）</p>
                <p>对未来有明确规划，但是保密。</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AgentFlow */}
        <motion.div variants={cardFade}>
          <div className={`${cardCls} p-8 md:p-10 h-full`}>
            <a href={projects[0].href} target="_blank" rel="noopener noreferrer" className="group block h-full">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-2xl font-medium font-serif text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors">
                  {projects[0].title}
                </h3>
                <span
                  className="shrink-0 text-sm px-3 py-1 rounded-full border"
                  style={{ color: projects[0].color, borderColor: projects[0].color + '40' }}
                >
                  {projects[0].tag}
                </span>
              </div>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{projects[0].desc}</p>
            </a>
          </div>
        </motion.div>

        {/* Auto-Tweet Agent */}
        <motion.div variants={cardFade}>
          <div className={`${cardCls} p-8 md:p-10 h-full`}>
            <a href={projects[1].href} target="_blank" rel="noopener noreferrer" className="group block h-full">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-2xl font-medium font-serif text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors">
                  {projects[1].title}
                </h3>
                <span
                  className="shrink-0 text-sm px-3 py-1 rounded-full border"
                  style={{ color: projects[1].color, borderColor: projects[1].color + '40' }}
                >
                  {projects[1].tag}
                </span>
              </div>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{projects[1].desc}</p>
            </a>
          </div>
        </motion.div>

        {/* RAG 2.0 */}
        <motion.div variants={cardFade}>
          <div className={`${cardCls} p-8 md:p-10 h-[400px]`}>
            <a href={projects[2].href} target="_blank" rel="noopener noreferrer" className="group block h-full">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-2xl font-medium font-serif text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors">
                  {projects[2].title}
                </h3>
                <span
                  className="shrink-0 text-sm px-3 py-1 rounded-full border"
                  style={{ color: projects[2].color, borderColor: projects[2].color + '40' }}
                >
                  {projects[2].tag}
                </span>
              </div>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{projects[2].desc}</p>
            </a>
          </div>
        </motion.div>

        {/* Chat with T — flip card */}
        <motion.div variants={cardFade} className="h-[400px]">
          <ChatFlipCard />
        </motion.div>

        {/* Music — full width */}
        <motion.div variants={cardFade} className="md:col-span-2">
          <div className={`${cardCls} p-8 md:p-10`}>
            <h2 className="font-caveat text-4xl text-[#6B8DAE] mb-6">Music</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {albums.map((album) => (
                <a
                  key={album.url}
                  href={album.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#E8E2DA] border border-white/20">
                    <img
                      src={album.cover}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Blog posts */}
        {posts.slice(0, 2).map((post) => (
          <motion.div key={post.slug} variants={cardFade}>
            <div className={`${cardCls} p-8 md:p-10 h-full`}>
              <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group block h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-medium font-serif text-[#2C2C2C] group-hover:text-[#6B8DAE] transition-colors">
                    {post.title}
                  </h3>
                  <time className="text-sm shrink-0 text-[#6B6B6B]">
                    {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </time>
                </div>
                <p className="text-[#6B6B6B] mb-4 leading-relaxed line-clamp-3">{post.summary}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full border text-[#6B6B6B]" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          </motion.div>
        ))}

        {/* Theme Toggle */}
        <motion.div variants={cardFade}>
          <div className={`${cardCls} p-8 md:p-10 flex flex-col items-center justify-center min-h-[140px]`}>
            <ThemeToggle />
            <span className="text-sm text-[#6B6B6B] mt-3 font-serif">切换主题</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={cardFade}>
          <div className={`${cardCls} p-8 md:p-10 flex flex-col items-center justify-center min-h-[140px]`}>
            <span className="font-caveat text-2xl mb-3 text-[#2C2C2C]">T.</span>
            <div className="flex gap-6 font-serif text-sm text-[#6B6B6B]">
              <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C2C2C] transition-colors">
                GitHub
              </a>
              <a href="mailto:tyn2005315@gmail.com" className="hover:text-[#2C2C2C] transition-colors">
                Email
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ChatFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '你好！有什么想了解的？' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setTimeout(scrollToBottom, 0);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMsg += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: assistantMsg };
          return next;
        });
        setTimeout(scrollToBottom, 0);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '抱歉，出了点问题。' }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 0);
    }
  };

  return (
    <div
      className={`${cardCls} flip-card flip-card-inner-base w-full h-full`}
      onClick={() => !isFlipped && setIsFlipped(true)}
      style={{ isolation: 'isolate' }}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s ease' }}>
        {/* Front */}
        <div className="flip-card-front flip-card-face">
          <div className="w-14 h-14 rounded-full bg-[#6B8DAE]/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#6B8DAE" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
              <circle cx="24" cy="24" r="8" fill="#6B8DAE" opacity="0.4" />
            </svg>
          </div>
          <span className="text-xl font-serif text-[#2C2C2C]">Chat with T</span>
          <span className="text-sm text-[#6B6B6B] mt-1">和 AI 版的我聊聊</span>
        </div>

        {/* Back — full chat UI, click empty area to flip back */}
        <div
          className="flip-card-back flip-card-face flex flex-col h-full cursor-default"
          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
        >
          {/* Header — no back button, click header also flips */}
          <div
            className="flex items-center gap-3 pt-4 pb-2 mb-3 border-b border-white/20 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-caveat text-2xl text-[#F5F0EB]">T&apos;s AI</span>
          </div>

          {/* Messages — only empty area background click flips back */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 cursor-default px-3 chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'rounded-2xl rounded-tr-sm'
                      : 'rounded-2xl rounded-tl-sm'
                  }`}
                  style={{
                    background: msg.role === 'user' ? '#6B8DAE' : 'rgba(255,255,255,0.15)',
                    color: '#F5F0EB',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-sm bg-white/10 text-[#F5F0EB]/60">
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 px-4 pb-4 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/20 text-[#F5F0EB] placeholder-[#F5F0EB]/40 outline-none border border-white/20 focus:border-white/50 transition-colors"
              disabled={isLoading}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#F5F0EB]/20 text-[#F5F0EB] hover:bg-[#F5F0EB]/30 border border-white/20 transition-colors disabled:opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
