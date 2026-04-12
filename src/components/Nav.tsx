"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F5F0EB]/80 backdrop-blur-md border-b border-[#D5CEC7] shadow-sm"
          : "bg-transparent border-b-0"
      }`}
      style={{ background: scrolled ? undefined : 'transparent', borderColor: scrolled ? '#D5CEC7' : 'transparent' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-caveat text-xl leading-none" style={{ color: 'var(--text)' }}>T.</span>
        <div className="flex gap-5 text-sm items-center self-center" style={{ color: 'var(--text-secondary)' }}>
          <a href="#about" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>About</a>
          <a href="#projects" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>Projects</a>
          <a href="#music" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>Music</a>
          <Link href="/posts" className="hover:text-[var(--text)] transition-colors duration-300" style={{ color: 'inherit' }}>Blog</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
