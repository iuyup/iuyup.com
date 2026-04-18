'use client';

import { useScrollTilt } from '@/components/hooks/useScrollTilt';

interface ScrollTiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** 禁用滚动动画 */
  disabled?: boolean;
}

export default function ScrollTiltCard({
  children,
  className,
  disabled = false,
}: ScrollTiltCardProps) {
  const { ref, tilt } = useScrollTilt<HTMLDivElement>({ threshold: 50 });

  const tiltClass = disabled
    ? ''
    : tilt === 'leave-top'
    ? 'scroll-tilt-leave-top'
    : tilt === 'leave-bottom'
    ? 'scroll-tilt-leave-bottom'
    : 'scroll-tilt-enter';

  return (
    <div
      className={`scroll-tilt-perspective transition-all duration-700 ease-out ${className ?? ''}`}
      style={{ perspective: '800px' }}
    >
      <div
        ref={ref}
        className={`scroll-tilt-target origin-center transition-all duration-700 [cubic-bezier(0.34,1.56,0.64,1)] ${tiltClass}`}
      >
        {children}
      </div>
    </div>
  );
}