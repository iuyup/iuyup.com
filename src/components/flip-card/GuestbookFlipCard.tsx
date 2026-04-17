'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-3 px-3 min-h-[480px] flex flex-col justify-between cursor-pointer';

const hoverSpring = { scale: 1.02 };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };

interface GuestbookMessage {
  id: string;
  name: string;
  text: string;
  date: string;
  likes: number;
}

const DEFAULT_MESSAGES: GuestbookMessage[] = [
  { id: '1', name: 'Alice', text: '网站做得真好看！', date: '2026-04-10', likes: 3 },
  { id: '2', name: 'Bob', text: '期待更多内容！', date: '2026-04-08', likes: 1 },
  { id: '3', name: 'Carol', text: '手绘风格太赞了', date: '2026-04-05', likes: 7 },
];

interface GuestbookFlipCardProps {
  tag?: CardVariant;
}

export function GuestbookFlipCard({ tag = 'default' }: GuestbookFlipCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const [isFlipped, setIsFlipped] = useState(false);
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/guestbook');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMessages(data.length > 0 ? data : DEFAULT_MESSAGES);
    } catch {
      setMessages(DEFAULT_MESSAGES);
    } finally {
      setLoading(false);
    }
  };

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [nameInput, setNameInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked[id]) return;

    try {
      const res = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setLiked((prev) => ({ ...prev, [id]: true }));
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
        );
      }
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nameInput.trim() || !msgInput.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), text: msgInput.trim() }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [newMsg, ...prev]);
        setNameInput('');
        setMsgInput('');
        setTimeout(() => setIsFlipped(false), 500);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit');
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('Failed to submit message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className={`${cardCls} flip-card flip-card-inner-base w-full h-[750px] card-hover`}
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
        <div className="flip-card-front flip-card-face flex flex-col items-center px-6 pt-6 pb-4 w-full h-full overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[rgba(107,141,174,0.2)] flex items-center justify-center mb-2 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#6B8DAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-caveat text-xl text-[#2C2C2C] flex-shrink-0">Guestbook</span>
          <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: variant.textSecondary }}>Click to leave a message</span>

          {/* Messages list */}
          <div className="flex-1 w-full mt-4 overflow-y-auto guestbook-messages space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full" style={{ color: variant.textSecondary }}>
                Loading...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full" style={{ color: variant.textSecondary }}>
                {error}
              </div>
            ) : (
              messages.map((msg) => {
                const isLiked = !!liked[msg.id];
                return (
                  <div key={msg.id} className="bg-white/50 rounded-xl p-5 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base text-[#2C2C2C] truncate">{msg.name}</p>
                        <p className="text-sm mt-1 break-words" style={{ color: variant.textSecondary }}>{msg.text}</p>
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
                        <span className="text-sm ml-1" style={{ color: variant.textSecondary }}>{msg.likes}</span>
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: variant.textSecondary }}>{msg.date}</p>
                  </div>
                );
              })
            )}
          </div>

          <p className="text-xs mt-2 flex-shrink-0" style={{ color: variant.textSecondary }}>{messages.length} messages total</p>
        </div>

        {/* Back */}
        <div
          className="flip-card-back flip-card-face flex flex-col relative p-5 gap-3 w-full h-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            className="absolute top-5 left-5 text-sm hover:text-[#2C2C2C] flex-shrink-0"
            style={{ color: variant.textSecondary }}
          >
            ← Back
          </button>

          <span className="font-caveat text-xl text-[#2C2C2C] pr-5 text-center w-full overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0 mt-1">Leave a message</span>

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Name"
            className="bg-white/40 border border-white/60 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] placeholder:text-[#999] outline-none focus:border-white/50 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />

          <textarea
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            placeholder="Your message..."
            className="bg-white/40 border border-white/60 rounded-xl px-4 py-2.5 flex-1 min-h-[140px] text-sm text-[#2C2C2C] placeholder:text-[#999] outline-none focus:border-white/50 resize-none"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-[#2C2C2C]/60 text-white rounded-xl text-sm font-medium hover:bg-[#2C2C2C]/75 transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
