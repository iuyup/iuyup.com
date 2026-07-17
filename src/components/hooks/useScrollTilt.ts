'use client';

import { useEffect, useRef, useState } from 'react';

type TiltDirection = 'enter' | 'leave-top' | 'leave-bottom';

interface UseScrollTiltOptions {
  /** Extra viewport margin in pixels before a leave animation starts. */
  threshold?: number;
}

export function useScrollTilt<T extends HTMLElement>(
  options: UseScrollTiltOptions = {}
) {
  const { threshold = 50 } = options;
  const ref = useRef<T>(null);
  const [tilt, setTilt] = useState<TiltDirection>('enter');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTilt('enter');
          return;
        }

        setTilt(entry.boundingClientRect.top < 0 ? 'leave-top' : 'leave-bottom');
      },
      { threshold: [0, 1], rootMargin: `${threshold}px` }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, tilt };
}
