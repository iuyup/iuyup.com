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

const cardCls = 'bg-[rgba(217,217,217,0.58)] backdrop-blur-md rounded-[2rem] py-14 px-10 min-h-[480px] flex flex-col justify-between cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]';

export default function BentoGrid({ posts }: BentoGridProps) {
  const openChat = () => {
    window.dispatchEvent(new CustomEvent('chat:open'));
  };

  return (
    <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="columns-1 md:columns-2 lg:columns-3 gap-8 md:gap-10"
      >
        {/* About */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
              About
            </span>
            <div className="flex flex-col gap-6 w-full">
              <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
                大家好哇，欢迎来到我的网站！
              </p>
              <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
                现在是 21 岁，大三在读。专业是光电，但对 AI 更感兴趣一些，所以现在大部分时间都在写 Agent 和拆开源项目的源码。现在在找 AI 开发相关的实习，真的好难找哇。
              </p>
              <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
                喜欢听歌，喜欢 R&B/Neo-soul/Jazz。喜欢陶喆、王力宏、方大同、黄宣。喜欢弹吉他组乐队（虽然很想说... 但是我不是二次元）。
              </p>
              <p className="text-base text-[#6B6B6B] leading-[1.8] whitespace-normal text-left">
                对未来有明确规划，但是保密。
              </p>
            </div>
            <div className="mt-auto pt-6 w-full text-left">
              <p className="text-xs text-[#6B6B6B]">21岁 · 大三在读 · 光电专业</p>
            </div>
          </div>
        </motion.div>

        {/* AgentFlow */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <a href={projects[0].href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center w-full h-full justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
                {projects[0].tag}
              </span>
              <h3 className="text-3xl lg:text-4xl leading-tight text-[#2C2C2C] mb-8 font-serif">
                {projects[0].title}
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-[90%] mb-8">
                {projects[0].desc}
              </p>
              <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Read More
              </span>
            </a>
          </div>
        </motion.div>

        {/* Auto-Tweet Agent */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <a href={projects[1].href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center w-full h-full justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
                {projects[1].tag}
              </span>
              <h3 className="text-3xl lg:text-4xl leading-tight text-[#2C2C2C] mb-8 font-serif">
                {projects[1].title}
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-[90%] mb-8">
                {projects[1].desc}
              </p>
              <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Read More
              </span>
            </a>
          </div>
        </motion.div>

        {/* Chat with T — flip card */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <ChatFlipCard />
        </motion.div>

        {/* Guestbook — flip card */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <GuestbookFlipCard />
        </motion.div>

        {/* RAG 2.0 */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <a href={projects[2].href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center w-full h-full justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
                {projects[2].tag}
              </span>
              <h3 className="text-3xl lg:text-4xl leading-tight text-[#2C2C2C] mb-8 font-serif">
                {projects[2].title}
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-[90%] mb-8">
                {projects[2].desc}
              </p>
              <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Read More
              </span>
            </a>
          </div>
        </motion.div>

        {/* Music */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
              Music
            </span>
            <div className="flex flex-col gap-4 w-full">
              <a href={albums[0].url} target="_blank" rel="noopener noreferrer" className="group block w-full">
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-[#E8E2DA]">
                  <img
                    src={albums[0].cover}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              </a>
              <div className="flex gap-3">
                {albums.slice(1).map((album) => (
                  <a
                    key={album.url}
                    href={album.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block flex-1"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#E8E2DA]">
                      <img
                        src={album.cover}
                        alt=""
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog posts */}
        {posts.slice(0, 2).map((post) => (
          <motion.div key={post.slug} variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
            <div className={`${cardCls} items-center text-center`}>
              <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col items-center text-center w-full h-full justify-between">
                <span className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm mb-8">
                  Article
                </span>
                <h3 className="text-2xl md:text-3xl leading-tight text-[#2C2C2C] mb-4 font-serif break-words">
                  {post.title}
                </h3>
                <time className="text-xs text-[#6B6B6B] mb-4">
                  {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </time>
                <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-[90%] mb-6">
                  {post.summary}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap justify-center mb-8">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full border text-[#6B6B6B]" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="mt-auto border border-[#2C2C2C]/30 text-[#2C2C2C] text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                  Read More
                </span>
              </Link>
            </div>
          </motion.div>
        ))}

        {/* Theme Toggle */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
            <ThemeToggle />
            <span className="text-sm text-[#6B6B6B] mt-3 font-serif">切换主题</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={cardFade} className="break-inside-avoid mb-6 md:mb-8">
          <div className={`${cardCls} items-center text-center`}>
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

function GuestbookFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [messages, setMessages] = useState<{ id: string; name: string; text: string; date: string; likes: number }[]>([
    { id: '1', name: 'Alice', text: '网站做得真好看！', date: '2026-04-10', likes: 3 },
    { id: '2', name: 'Bob', text: '期待更多内容！', date: '2026-04-08', likes: 1 },
    { id: '3', name: 'Carol', text: '手绘风格太赞了', date: '2026-04-05', likes: 7 },
  ]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [nameInput, setNameInput] = useState('');
  const [msgInput, setMsgInput] = useState('');

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentlyLiked = liked[id];
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    setMessages(prev => prev.map(m => m.id === id ? { ...m, likes: currentlyLiked ? m.likes - 1 : m.likes + 1 } : m));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nameInput.trim() || !msgInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      text: msgInput.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    setMessages(prev => [newMsg, ...prev]);
    setNameInput('');
    setMsgInput('');
    setTimeout(() => setIsFlipped(false), 500);
  };

  return (
    <div
      className={`${cardCls} flip-card flip-card-inner-base w-full h-[700px]`}
      onClick={() => !isFlipped && setIsFlipped(true)}
      style={{ isolation: 'isolate' }}
    >
      <div
        className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s ease' }}
      >
        {/* Front */}
        <div className="flip-card-front flip-card-face flex flex-col items-center px-6 pt-6 pb-4 w-full h-full overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[rgba(107,141,174,0.2)] flex items-center justify-center mb-2 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#6B8DAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-caveat text-xl text-[#2C2C2C] flex-shrink-0">Guestbook</span>
          <span className="text-sm text-[#6B6B6B] mt-0.5 flex-shrink-0">Click to leave a message</span>

          {/* Messages list */}
          <div className="flex-1 w-full mt-4 overflow-y-auto guestbook-messages space-y-3">
            {messages.map(msg => {
              const isLiked = !!liked[msg.id];
              return (
                <div key={msg.id} className="bg-white/50 rounded-xl p-5 w-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base text-[#2C2C2C] truncate">{msg.name}</p>
                      <p className="text-sm text-[#6B6B6B] mt-1 break-words">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="heart-container"
                        title="Like"
                        onClick={(e) => handleLike(msg.id, e)}
                      >
                        <div className="svg-container">
                          <svg viewBox="0 0 24 24" className={`svg-outline ${isLiked ? 'hidden' : ''}`} xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
                          </svg>
                          <svg viewBox="0 0 24 24" className={`svg-filled ${isLiked ? '' : 'hidden'} ${isLiked ? 'animate-heart-pop' : ''}`} xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
                          </svg>
                        </div>
                      </button>
                      <span className="text-sm text-[#999] ml-1">{msg.likes}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#999] mt-2">{msg.date}</p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#6B8DAE] mt-2 flex-shrink-0">{messages.length} messages total</p>
        </div>

        {/* Back */}
        <div
          className="flip-card-back flip-card-face flex flex-col relative p-5 gap-3 w-full h-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            className="absolute top-5 left-5 text-sm text-[#6B6B6B] hover:text-[#2C2C2C] flex-shrink-0"
          >
            ← Back
          </button>

          <span className="font-caveat text-xl text-[#2C2C2C] pr-5 text-center w-full overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0 mt-1">Leave a message</span>

          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Name"
            className="bg-white/40 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] placeholder:text-[#999] outline-none focus:border-white/50 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />

          <textarea
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            placeholder="Your message..."
            className="bg-white/40 border border-white/30 rounded-xl px-4 py-2.5 flex-1 min-h-[140px] text-sm text-[#2C2C2C] placeholder:text-[#999] outline-none focus:border-white/50 resize-none"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-[#2C2C2C]/60 text-white rounded-xl text-sm font-medium hover:bg-[#2C2C2C]/75 transition-colors flex-shrink-0"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
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
      className={`${cardCls} flip-card flip-card-inner-base w-full h-[700px]`}
      onClick={() => !isFlipped && setIsFlipped(true)}
      style={{ isolation: 'isolate' }}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s ease' }}>
        {/* Front */}
        <div className="flip-card-front flip-card-face w-full h-full overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-[#6B8DAE]/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#6B8DAE" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
              <circle cx="24" cy="24" r="8" fill="#6B8DAE" opacity="0.4" />
            </svg>
          </div>
          <span className="text-xl font-serif text-[#2C2C2C]">Chat with T</span>
          <span className="text-sm text-[#6B6B6B] mt-1">和 AI 版的我聊聊</span>
        </div>

        {/* Back — full chat UI */}
        <div
          className="flip-card-back flip-card-face flex flex-col w-full h-full overflow-hidden cursor-default"
          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 pt-5 pb-2 mb-3 border-b border-white/20 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-caveat text-2xl text-[#F5F0EB]">T&apos;s AI</span>
          </div>

          {/* Messages — only empty area background click flips back */}
          <div className="flex-1 w-full overflow-y-auto space-y-4 mb-4 cursor-default px-4 chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-base whitespace-pre-wrap ${
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
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-base bg-white/10 text-[#F5F0EB]/60">
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 px-4 pb-5 pt-2 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 px-4 py-4 rounded-lg text-base bg-white/20 text-[#F5F0EB] placeholder-[#F5F0EB]/40 outline-none border border-white/20 focus:border-white/50 transition-colors"
              disabled={isLoading}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-4 rounded-lg text-sm font-medium bg-[#F5F0EB]/20 text-[#F5F0EB] hover:bg-[#F5F0EB]/30 border border-white/20 transition-colors disabled:opacity-50"
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
