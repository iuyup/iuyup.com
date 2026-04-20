'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';

const cardCls = 'backdrop-blur-2xl rounded-3xl border border-white/60 py-10 px-8 min-h-[300px] flex flex-col justify-between cursor-pointer';

const cardFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

interface SocialItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function GitHubIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="22,6 12,13 2,6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZhihuIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6h6v12h-2l-2 2l-1-2h-1V6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12h6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 6h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 4c-.5 2.5-1.5 3.5-2.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6v7c0 4.5-2 5.5-4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 18l-3-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function JuejinIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12l10 7.422l10 -7.422" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 9l5 4l5 -4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 6l1 .8l1 -.8l-1 -.8l-1 .8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SocialItem({ href, label, icon }: SocialItemProps) {
  return (
    <li className="relative group">
      {/* Isometric stack layers */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-[0.18] group-hover:translate-x-1 group-hover:translate-y-1 transition-all duration-300"
        style={{ background: '#D4856A', transform: 'translate(-3px, -3px)' }}
      />
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-[0.12] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300"
        style={{ background: '#D4856A', transform: 'translate(-6px, -6px)' }}
      />
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-[0.06] transition-all duration-300"
        style={{ background: '#D4856A', transform: 'translate(-9px, -9px)' }}
      />

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group-hover:bg-[#6B8DAE]/10"
      >
        {/* Icon */}
        <span
          className="text-[#6B6B6B] group-hover:text-[#6B8DAE] group-hover:translate-x-[15px] group-hover:translate-y-[15px] transition-all duration-300"
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {icon}
        </span>

        {/* Text label */}
        <span
          className="absolute left-14 text-sm text-[#6B8DAE] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap font-medium"
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {label}
        </span>
      </a>
    </li>
  );
}

interface SocialLinksCardProps {
  tag?: CardVariant;
}

export function SocialLinksCard({ tag = 'default' }: SocialLinksCardProps) {
  const variant = CARD_VARIANTS[tag] ?? CARD_VARIANTS.default;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={cardFade}
      className="break-inside-avoid mb-6 md:mb-8"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={springTransition}
        style={{ background: variant.bg }}
        className={`${cardCls} card-hover`}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1 mb-4">
          <motion.span
            className="relative inline-block self-center"
            style={{ transformStyle: 'preserve-3d', originX: 0.5, originY: 0.5 }}
            animate={{ rotateX: isHovered ? -180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.span
              className="text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm block"
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            >
              links
            </motion.span>
            <motion.span
              className="absolute inset-0 text-[10px] uppercase tracking-widest bg-white/40 text-[#2C2C2C] px-3 py-1 rounded-sm block"
              style={{ transform: 'rotateX(180deg)' }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              links
            </motion.span>
          </motion.span>
          <span className="text-sm text-[#6B6B6B] mt-1">Find me online</span>
        </div>

        {/* Social links */}
        <ul className="flex flex-col gap-2 items-center">
          <SocialItem href="https://github.com/iuyup" label="GitHub" icon={<GitHubIcon />} />
          <SocialItem href="mailto:tyn2005315@gmail.com" label="Email" icon={<EmailIcon />} />
          <SocialItem href="https://www.zhihu.com/people/ding-wen-xuan-86-64" label="知乎" icon={<ZhihuIcon />} />
          <SocialItem href="https://juejin.cn/user/3317694868761003" label="掘金" icon={<JuejinIcon />} />
        </ul>

        {/* Footer */}
        <p className="text-xs text-center text-[#6B6B6B] mt-4">
          Always open to a good conversation.
        </p>
      </motion.div>
    </motion.div>
  );
}
