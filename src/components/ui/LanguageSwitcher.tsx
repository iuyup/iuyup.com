"use client";

import { IconLanguage } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getEnglishSlug,
  getSourceSlug,
  type TranslatedCollection,
} from "@/lib/content-translations";
import styles from "./LanguageSwitcher.module.css";

function routeSlug(pathname: string, prefix: string) {
  if (!pathname.startsWith(`${prefix}/`)) {
    return null;
  }

  const rawSlug = pathname.slice(prefix.length + 1);
  if (!rawSlug || rawSlug.includes("/")) {
    return null;
  }

  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
}

function translatedEntryHref(
  pathname: string,
  collection: TranslatedCollection,
  direction: "toEnglish" | "toChinese"
) {
  const prefix = direction === "toEnglish" ? `/${collection}` : `/en/${collection}`;
  const slug = routeSlug(pathname, prefix);
  if (!slug) {
    return null;
  }

  const translatedSlug =
    direction === "toEnglish"
      ? getEnglishSlug(collection, slug)
      : getSourceSlug(collection, slug);

  if (!translatedSlug) {
    return null;
  }

  const targetPrefix = direction === "toEnglish" ? `/en/${collection}` : `/${collection}`;
  return `${targetPrefix}/${encodeURIComponent(translatedSlug)}`;
}

function languageHrefs(pathname: string) {
  if (pathname === "/en" || pathname === "/") {
    return { chinese: "/", english: "/en", hasPair: true };
  }

  if (pathname === "/posts" || pathname === "/en/posts") {
    return { chinese: "/posts", english: "/en/posts", hasPair: true };
  }

  if (pathname === "/notes" || pathname === "/en/notes") {
    return { chinese: "/notes", english: "/en/notes", hasPair: true };
  }

  const englishPost = translatedEntryHref(pathname, "posts", "toEnglish");
  const chinesePost = translatedEntryHref(pathname, "posts", "toChinese");
  if (englishPost) {
    return {
      chinese: pathname,
      english: englishPost,
      hasPair: true,
    };
  }
  if (chinesePost) {
    return {
      chinese: chinesePost,
      english: pathname,
      hasPair: true,
    };
  }

  const englishNote = translatedEntryHref(pathname, "notes", "toEnglish");
  const chineseNote = translatedEntryHref(pathname, "notes", "toChinese");
  if (englishNote) {
    return {
      chinese: pathname,
      english: englishNote,
      hasPair: true,
    };
  }
  if (chineseNote) {
    return {
      chinese: chineseNote,
      english: pathname,
      hasPair: true,
    };
  }

  return { chinese: pathname.startsWith("/en") ? "/" : pathname, english: "/en", hasPair: false };
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const hrefs = languageHrefs(pathname);
  const isChineseJournalEntry =
    !isEnglish &&
    (routeSlug(pathname, "/posts") !== null || routeSlug(pathname, "/notes") !== null);

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

  return (
    <div className={styles.root} ref={rootRef}>
      <nav
        id="language-switcher-options"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-label={isEnglish ? "Choose language" : "选择语言"}
        aria-hidden={!open}
      >
        <Link
          href={hrefs.chinese}
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
          href={hrefs.english}
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
          ) : isChineseJournalEntry && !hrefs.hasPair ? (
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
