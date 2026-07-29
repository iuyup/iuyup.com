"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ReadingProgress.module.css";

const CIRCUMFERENCE = 122.522;
const IDLE_DELAY_MS = 1100;

function getReadingProgress(targetId?: string) {
  if (!targetId) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      return 0;
    }

    return Math.round(Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)));
  }

  const content = document.getElementById(targetId);
  if (!content) {
    return 0;
  }

  const contentTop = window.scrollY + content.getBoundingClientRect().top;
  const start = contentTop - window.innerHeight * 0.35;
  const end = contentTop + content.scrollHeight - window.innerHeight * 0.65;

  if (end <= start) {
    return window.scrollY >= end ? 100 : 0;
  }

  return Math.round(Math.min(100, Math.max(0, ((window.scrollY - start) / (end - start)) * 100)));
}

interface ReadingProgressProps {
  targetId?: string;
}

export default function ReadingProgress({ targetId }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [idle, setIdle] = useState(false);
  const [hovered, setHovered] = useState(false);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    function clearIdleTimer() {
      if (idleTimer.current !== null) {
        window.clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    }

    function settle() {
      const nextProgress = getReadingProgress(targetId);
      setProgress(nextProgress);

      if (nextProgress === 0) {
        setIdle(false);
        setVisible(false);
        return;
      }

      setIdle(true);
    }

    function handleScroll() {
      const nextProgress = getReadingProgress(targetId);
      setProgress(nextProgress);
      setIdle(false);
      setVisible(true);
      clearIdleTimer();
      idleTimer.current = window.setTimeout(settle, IDLE_DELAY_MS);
    }

    function handleResize() {
      setProgress(getReadingProgress(targetId));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      clearIdleTimer();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetId]);

  function scrollToTop() {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  }

  const offset = CIRCUMFERENCE * (1 - progress / 100);
  const showArrow = idle || hovered;

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ""} ${showArrow ? styles.showArrow : ""}`}
      aria-label="回到文章开头"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <svg className={styles.ring} viewBox="0 0 44 44" aria-hidden="true">
        <circle className={styles.track} cx="22" cy="22" r="19.5" />
        <circle
          className={styles.indicator}
          cx="22"
          cy="22"
          r="19.5"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={styles.center}>
        <span className={styles.percentage}>{progress}%</span>
        <svg className={styles.arrow} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M5 5.5h18M14 23V10M8.5 15.5 14 10l5.5 5.5" />
        </svg>
      </span>
    </button>
  );
}
