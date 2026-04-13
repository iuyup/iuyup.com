"use client";

import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { useState } from "react";

export default function ScrollHint() {
  const [mounted] = useState(() => typeof window !== "undefined");
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  if (!mounted) {
    return (
      <div className="pt-12">
        <svg width="24" height="36" viewBox="0 0 24 36" className="opacity-40">
          <rect x="1" y="1" width="22" height="34" rx="11" stroke="#6B6B6B" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="10" r="2.5" fill="#6B6B6B" />
        </svg>
      </div>
    );
  }

  return (
    <motion.div style={{ opacity }} className="pt-12">
      <svg width="24" height="36" viewBox="0 0 24 36" className="opacity-40">
        <rect x="1" y="1" width="22" height="34" rx="11" stroke="#6B6B6B" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="10" r="2.5" fill="#6B6B6B" />
      </svg>
    </motion.div>
  );
}
