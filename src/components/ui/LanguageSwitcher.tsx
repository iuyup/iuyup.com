"use client";

import { IconLanguage } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const isChineseJournal = pathname.startsWith("/posts") || pathname.startsWith("/notes");

  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  }, [isEnglish]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (pathname.startsWith("/studio")) {
    return null;
  }

  const currentLanguage = isEnglish ? "English" : "中文";
  const englishHref = isEnglish ? pathname : "/en";

  return (
    <div className={styles.root} ref={rootRef}>
      <nav
        id="language-switcher-options"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-label={isEnglish ? "Choose language" : "选择语言"}
        aria-hidden={!open}
      >
        <Link
          href="/"
          hrefLang="zh-CN"
          lang="zh-CN"
          className={`${styles.option} ${!isEnglish ? styles.active : ""}`}
          aria-current={!isEnglish ? "page" : undefined}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span>中文</span>
          {!isEnglish && <span className={styles.currentMark}>当前</span>}
        </Link>
        <Link
          href={englishHref}
          hrefLang="en"
          lang="en"
          className={`${styles.option} ${isEnglish ? styles.active : ""}`}
          aria-current={isEnglish ? "page" : undefined}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span>English</span>
          {isEnglish ? (
            <span className={styles.currentMark}>Current</span>
          ) : isChineseJournal ? (
            <span className={styles.pendingMark}>文章筹备中</span>
          ) : null}
        </Link>
      </nav>

      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-label={
          isEnglish
            ? `Choose language, current language is ${currentLanguage}`
            : `切换语言，当前语言为${currentLanguage}`
        }
        aria-expanded={open}
        aria-controls="language-switcher-options"
        onClick={() => setOpen((value) => !value)}
      >
        <IconLanguage size={27} stroke={1.65} aria-hidden="true" />
      </button>
    </div>
  );
}
