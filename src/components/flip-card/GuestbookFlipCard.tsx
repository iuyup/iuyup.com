'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-3 px-3 min-h-[480px] flex flex-col justify-between cursor-pointer';

const hoverSpring = { scale: 1.02 };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.5 };
const GUESTBOOK_REQUEST_TIMEOUT_MS = 12_000;
const GUESTBOOK_RETRY_DELAY_MS = 1_500;
const TRANSIENT_GUESTBOOK_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

interface GuestbookMessage {
  id: string;
  name: string;
  text: string;
  date: string;
  likes: number;
  status?: 'approved' | 'pending' | 'rejected';
}

interface GuestbookPage {
  messages: GuestbookMessage[];
  nextCursor?: string;
}

async function responseError(response: Response, fallback: string) {
  try {
    const data: unknown = await response.json();
    if (
      data &&
      typeof data === 'object' &&
      'error' in data &&
      typeof data.error === 'string' &&
      data.error.trim()
    ) {
      return data.error;
    }
  } catch {
    // Fall back to a user-friendly message when the proxy cannot return JSON.
  }

  return fallback;
}

function abortReason(signal: AbortSignal) {
  return signal.reason ?? new DOMException('Request cancelled.', 'AbortError');
}

function waitForRetry(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortReason(signal));
      return;
    }

    const handleAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, GUESTBOOK_RETRY_DELAY_MS);

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

async function fetchWithTimeout(input: string, signal: AbortSignal) {
  const attemptController = new AbortController();
  const handleAbort = () => attemptController.abort(abortReason(signal));

  if (signal.aborted) {
    handleAbort();
  } else {
    signal.addEventListener('abort', handleAbort, { once: true });
  }

  const timeout = setTimeout(() => {
    attemptController.abort(new DOMException('Guestbook request timed out.', 'TimeoutError'));
  }, GUESTBOOK_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { signal: attemptController.signal });
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', handleAbort);
  }
}

async function fetchGuestbookWithRetry(input: string, signal: AbortSignal) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, signal);
      const shouldRetry =
        attempt === 0 && TRANSIENT_GUESTBOOK_STATUSES.has(response.status);

      if (!shouldRetry) {
        return response;
      }

      await response.body?.cancel();
    } catch (error) {
      if (signal.aborted || attempt === 1) {
        throw error;
      }
    }

    await waitForRetry(signal);
  }

  throw new Error('Guestbook request failed.');
}

interface GuestbookFlipCardProps {
  tag?: CardVariant;
}

export function GuestbookFlipCard({ tag = 'default' }: GuestbookFlipCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const cardRef = useRef<HTMLDivElement>(null);
  const hasStartedLoadRef = useRef(false);
  const initialRequestRef = useRef<Promise<void> | null>(null);
  const activeControllersRef = useRef(new Set<AbortController>());
  const mountedRef = useRef(true);
  const unmountAbortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [hasRequestedMessages, setHasRequestedMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [liking, setLiking] = useState<Record<string, boolean>>({});
  const [nameInput, setNameInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (initialRequestRef.current) {
      return initialRequestRef.current;
    }

    const controller = new AbortController();
    activeControllersRef.current.add(controller);

    const request = (async () => {
      if (mountedRef.current) {
        setHasRequestedMessages(true);
        setLoading(true);
        setLoadError(null);
      }

      try {
        const res = await fetchGuestbookWithRetry('/api/guestbook', controller.signal);
        if (!res.ok) {
          const message = await responseError(res, 'Guestbook is temporarily unavailable.');
          if (mountedRef.current) {
            setMessages([]);
            setNextCursor(null);
            setLoadError(message);
          }
          return;
        }

        const data: GuestbookPage = await res.json();
        if (mountedRef.current) {
          setMessages(data.messages);
          setNextCursor(data.nextCursor ?? null);
        }
      } catch {
        if (!controller.signal.aborted && mountedRef.current) {
          setMessages([]);
          setNextCursor(null);
          setLoadError('Guestbook is temporarily unavailable. Please try again.');
        }
      } finally {
        activeControllersRef.current.delete(controller);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    initialRequestRef.current = request;
    try {
      await request;
    } finally {
      if (initialRequestRef.current === request) {
        initialRequestRef.current = null;
      }
    }
  }, []);

  const ensureMessagesLoaded = useCallback(() => {
    if (hasStartedLoadRef.current) return;

    hasStartedLoadRef.current = true;
    void fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const activeControllers = activeControllersRef.current;
    mountedRef.current = true;
    if (unmountAbortTimerRef.current) {
      clearTimeout(unmountAbortTimerRef.current);
      unmountAbortTimerRef.current = null;
    }

    return () => {
      mountedRef.current = false;
      unmountAbortTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) {
          activeControllers.forEach((controller) => controller.abort());
          activeControllers.clear();
        }
      }, 0);
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (!('IntersectionObserver' in window)) {
      ensureMessagesLoaded();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        ensureMessagesLoaded();
        observer.disconnect();
      },
      { rootMargin: '320px 0px', threshold: 0.01 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [ensureMessagesLoaded]);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked[id] || liking[id]) return;

    setActionError(null);
    setLiking((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const updatedMsg: GuestbookMessage = await res.json();
        setLiked((prev) => ({ ...prev, [id]: true }));
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? updatedMsg : m))
        );
      } else {
        setActionError(await responseError(res, 'Could not like this message. Please try again.'));
      }
    } catch (error) {
      console.error('Failed to like:', error);
      setActionError('Could not like this message. Please try again.');
    } finally {
      setLiking((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nameInput.trim() || !msgInput.trim() || submitting) return;

    setActionError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), text: msgInput.trim() }),
      });

      if (res.ok) {
        const newMsg: GuestbookMessage = await res.json();
        if (newMsg.status === 'approved') {
          setMessages((prev) => [newMsg, ...prev]);
        } else {
          alert('Your message was submitted for review.');
        }
        setNameInput('');
        setMsgInput('');
        setTimeout(() => setIsFlipped(false), 500);
      } else {
        setActionError(await responseError(res, 'Failed to submit message. Please try again.'));
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      setActionError('Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextCursor || loadingMore) return;

    setActionError(null);
    setLoadingMore(true);
    const controller = new AbortController();
    activeControllersRef.current.add(controller);
    try {
      const res = await fetchGuestbookWithRetry(
        `/api/guestbook?cursor=${encodeURIComponent(nextCursor)}`,
        controller.signal
      );
      if (!res.ok) {
        setActionError(await responseError(res, 'Could not load more messages. Please try again.'));
        return;
      }
      const data: GuestbookPage = await res.json();
      setMessages((prev) => [...prev, ...data.messages]);
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('Failed to load more messages:', error);
        setActionError('Could not load more messages. Please try again.');
      }
    } finally {
      activeControllersRef.current.delete(controller);
      if (mountedRef.current) {
        setLoadingMore(false);
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`${cardCls} flip-card flip-card-inner-base w-full h-[750px] card-hover`}
      onClick={() => {
        ensureMessagesLoaded();
        if (!isFlipped) setIsFlipped(true);
      }}
      onPointerEnter={ensureMessagesLoaded}
      onFocusCapture={ensureMessagesLoaded}
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
            {!hasRequestedMessages ? (
              <div className="flex items-center justify-center h-full px-4 text-center text-sm" style={{ color: variant.textSecondary }}>
                Messages load when this card is nearby.
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full" role="status" aria-live="polite" style={{ color: variant.textSecondary }}>
                Loading...
              </div>
            ) : loadError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center" role="alert" style={{ color: variant.textSecondary }}>
                <p className="text-sm">{loadError}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void fetchMessages();
                  }}
                  className="rounded-full border border-[#2C2C2C]/30 px-4 py-2 text-xs hover:bg-white/30"
                >
                  Retry
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm" style={{ color: variant.textSecondary }}>
                No messages yet. Be the first to leave one.
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
                            disabled={isLiked || !!liking[msg.id]}
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

          {nextCursor && !loading && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs mt-2 hover:text-[#2C2C2C] disabled:opacity-50 flex-shrink-0"
              style={{ color: variant.textSecondary }}
            >
              {loadingMore ? 'Loading...' : 'Load more messages'}
            </button>
          )}
          {hasRequestedMessages && !loading && !loadError && (
            <p className="text-xs mt-2 flex-shrink-0" style={{ color: variant.textSecondary }}>{messages.length} messages loaded</p>
          )}
          {actionError && (
            <p className="text-xs mt-2 flex-shrink-0" role="alert" style={{ color: '#9B3A32' }}>{actionError}</p>
          )}
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
            className="bg-white/40 border border-white/60 rounded-xl px-4 py-2.5 text-base text-[#2C2C2C] placeholder:text-[#999] outline-none focus:border-white/50 flex-shrink-0 sm:text-sm"
            onClick={(e) => e.stopPropagation()}
          />

          <textarea
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            placeholder="Your message..."
            className="bg-white/40 border border-white/60 rounded-xl px-4 py-2.5 flex-1 min-h-[140px] text-base text-[#2C2C2C] placeholder:text-[#999] outline-none focus:border-white/50 resize-none sm:text-sm"
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
          {actionError && (
            <p className="text-xs text-center" role="alert" style={{ color: '#9B3A32' }}>{actionError}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
