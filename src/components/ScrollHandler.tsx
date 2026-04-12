"use client";

import { useState, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";

export function useScrollOpacity() {
  const { scrollYProgress } = useScroll();
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  return scrollHintOpacity;
}

export function useNavScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrolled;
}
