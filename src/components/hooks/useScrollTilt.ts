'use client';

import { useEffect, useRef, useState } from 'react';

type TiltDirection = 'enter' | 'leave-top' | 'leave-bottom';

interface UseScrollTiltOptions {
  /** 视口外多少px触发离开动画 */
  threshold?: number;
}

export function useScrollTilt<T extends HTMLElement>(
  options: UseScrollTiltOptions = {}
) {
  const { threshold = 50 } = options;
  const ref = useRef<T>(null);
  const [tilt, setTilt] = useState<TiltDirection>('enter');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 初始化时检查是否已经在视口外（向上滚动时刷新页面）
    const rect = el.getBoundingClientRect();
    if (rect.top < 0) {
      setTilt('leave-top');
    } else if (rect.bottom > window.innerHeight) {
      setTilt('leave-bottom');
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTilt('enter');
        } else {
          const rect = entry.boundingClientRect;
          if (rect.top < 0) {
            setTilt('leave-top');
          } else {
            setTilt('leave-bottom');
          }
        }
      },
      { threshold: [0, 1], rootMargin: `${threshold}px` }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, tilt };
}