'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';
import type { HomeLocale } from '@/lib/home-content';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-3 px-3 min-h-[480px] flex flex-col justify-between cursor-pointer';

const hoverSpring = { scale: 1.02 };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };
// Keep one slot for the message currently being sent; the Go API accepts 12.
const MAX_HISTORY_MESSAGES = 11;

interface ChatFlipCardProps {
  tag?: CardVariant;
  locale?: HomeLocale;
}

const chatCopy: Record<HomeLocale, {
  welcome: string;
  error: string;
  subtitle: string;
  thinking: string;
  placeholder: string;
  send: string;
}> = {
  'zh-CN': {
    welcome: '你好！有什么想了解的？',
    error: '抱歉，出了点问题。',
    subtitle: '和 AI 版的我聊聊',
    thinking: '思考中...',
    placeholder: '输入消息...',
    send: '发送',
  },
  en: {
    welcome: 'Hey! What would you like to know?',
    error: 'Sorry—something went wrong.',
    subtitle: 'Ask the AI version of me anything.',
    thinking: 'Thinking…',
    placeholder: 'Type a message…',
    send: 'Send',
  },
};

export function ChatFlipCard({ tag = 'default', locale = 'zh-CN' }: ChatFlipCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const copy = chatCopy[locale];
  const [isFlipped, setIsFlipped] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: copy.welcome },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messagesRef.current.slice(-MAX_HISTORY_MESSAGES), userMsg],
        }),
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
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: copy.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`${cardCls} flip-card flip-card-inner-base w-full h-[700px] card-hover`}
      onClick={() => !isFlipped && setIsFlipped(true)}
      whileHover={hoverSpring}
      transition={springTransition}
      style={{ background: variant.bg, isolation: 'isolate' }}
    >
      <div
        className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s ease' }}
      >
        {/* Front */}
        <div className="flip-card-front flip-card-face w-full h-full overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-[#6B8DAE]/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#6B8DAE" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
              <circle cx="24" cy="24" r="8" fill="#6B8DAE" opacity="0.4" />
            </svg>
          </div>
          <span className="text-xl font-serif text-[#2C2C2C]">Chat with T</span>
          <span className="text-sm mt-1" style={{ color: variant.textSecondary }}>{copy.subtitle}</span>
        </div>

        {/* Back — full chat UI */}
        <div
          className="flip-card-back flip-card-face flex flex-col w-full h-full overflow-hidden cursor-default"
          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 pt-5 pb-2 mb-3 border-b border-white/20 px-4 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-brand text-2xl text-[#F5F0EB]">T&apos;s AI</span>
          </div>

          {/* Messages */}
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
                  {copy.thinking}
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
              placeholder={copy.placeholder}
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
              {copy.send}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
