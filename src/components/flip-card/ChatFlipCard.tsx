'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';
import type { HomeLocale } from '@/lib/home-content';
import { MAX_CHAT_CHARACTERS } from '@/lib/chat-client';
import { useChat } from '@/components/hooks/useChat';

export function ChatFlipCard({ tag = 'default', locale = 'zh-CN' }: { tag?: CardVariant; locale?: HomeLocale }) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const english = locale === 'en';
  const reducedMotion = useReducedMotion();
  const [isFlipped, setIsFlipped] = useState(false);
  const [input, setInput] = useState('');
  const openButton = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageList = useRef<HTMLDivElement>(null);
  const chat = useChat(locale);
  const { stop } = chat;

  useEffect(() => { if (isFlipped && !chat.isLoading) inputRef.current?.focus(); }, [isFlipped, chat.isLoading]);
  useEffect(() => {
    const element = messageList.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [chat.messages, chat.isLoading]);

  const close = useCallback(() => {
    stop();
    setIsFlipped(false);
    requestAnimationFrame(() => openButton.current?.focus());
  }, [stop]);

  useEffect(() => {
    if (!isFlipped) return;
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') close(); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isFlipped, close]);

  const errors: Record<string, string> = english ? {
    'invalid-input': 'Enter a message of up to 2,000 characters.',
    'rate-limit': 'Too many messages. Please try again in a minute.',
    'empty-reply': 'No reply was received. Please try again.',
    timeout: 'The reply timed out. You can try again.', stopped: 'Generation stopped.',
  } : {
    'invalid-input': '请输入不超过 2,000 字的消息。',
    'rate-limit': '发送有些频繁，请一分钟后重试。',
    'empty-reply': '这次没有收到回复，可以重试。',
    timeout: '回复超时了，可以重试。', stopped: '已停止生成。',
  };

  return (
    <motion.div
      className="backdrop-blur-2xl rounded-3xl border border-white/60 p-3 flip-card w-full h-[min(700px,85dvh)] min-h-[420px] card-hover"
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      style={{ background: variant.bg, isolation: 'isolate' }}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ position: 'relative', height: '100%', transformStyle: 'preserve-3d', transition: reducedMotion ? 'none' : 'transform 0.5s ease' }}>
        <div className="flip-card-front flip-card-face w-full h-full" inert={isFlipped} aria-hidden={isFlipped}>
          <button ref={openButton} type="button" onClick={() => setIsFlipped(true)} aria-expanded={isFlipped} className="flex h-full w-full flex-col items-center justify-center rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2C2C]">
            <span className="type-heading text-xl text-[#2C2C2C]">Chat with T</span>
            <span className="text-sm mt-2" style={{ color: variant.textSecondary }}>{english ? 'Ask the AI version of me anything.' : '和 AI 版的我聊聊'}</span>
          </button>
        </div>
        <div className="flip-card-back flip-card-face flex flex-col w-full h-full overflow-hidden" inert={!isFlipped} aria-hidden={!isFlipped}>
          <header className="flex items-center justify-between px-4 py-4 border-b border-white/20">
            <span className="font-brand text-2xl">T&apos;s AI</span>
            <button type="button" onClick={close} className="rounded-lg px-3 py-2 border border-white/40">{english ? 'Close' : '关闭'}</button>
          </header>
          <div ref={messageList} className="flex-1 min-h-0 overflow-y-auto space-y-4 p-4 chat-messages" role="log" aria-label={english ? 'Conversation' : '对话记录'} aria-live="polite" aria-busy={chat.isLoading}>
            {chat.messages.length === 0 && <p>{english ? 'Hey! What would you like to know?' : '你好！有什么想了解的？'}</p>}
            {chat.messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl bg-white/15 px-4 py-3 [overflow-wrap:anywhere]">{message.content}</p>
              </div>
            ))}
            {chat.isLoading && <p role="status">{english ? 'Replying…' : '正在回复…'}</p>}
          </div>
          {chat.error && <div className="px-4 pb-2" role="status">
            <p className="text-sm">{errors[chat.error] ?? (english ? 'The service is temporarily unavailable. Please try again.' : '服务暂时不可用，请稍后重试。')}</p>
            {chat.canRetry && <button type="button" onClick={() => void chat.retry()} className="underline mt-2">{english ? 'Retry' : '重试'}</button>}
          </div>}
          <form className="px-4 pb-4 flex flex-col gap-2" onSubmit={(event) => { event.preventDefault(); const prompt = input; setInput(''); void chat.send(prompt); }}>
            <label className="text-sm" htmlFor="home-chat-input">{english ? 'Your message' : '你的消息'}</label>
            <textarea id="home-chat-input" ref={inputRef} rows={2} value={input} onChange={(event) => setInput(event.target.value)} disabled={chat.isLoading} className="w-full min-w-0 resize-none rounded-lg bg-white/20 px-3 py-2 text-base border border-white/40" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs">{Array.from(input).length.toLocaleString()} / {MAX_CHAT_CHARACTERS.toLocaleString()}</span>
              {chat.isLoading
                ? <button type="button" onClick={chat.stop} className="rounded-lg border border-white/40 px-4 py-2">{english ? 'Stop' : '停止'}</button>
                : <button type="submit" disabled={!input.trim() || Array.from(input).length > MAX_CHAT_CHARACTERS} className="rounded-lg border border-white/40 px-4 py-2 disabled:opacity-50">{english ? 'Send' : '发送'}</button>}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
