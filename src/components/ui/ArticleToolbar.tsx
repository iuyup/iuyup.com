"use client";

import Link from "next/link";
import { useState } from "react";
import type { HomeLocale } from "@/lib/home-content";
import styles from "./ArticleToolbar.module.css";

interface ArticleToolbarProps {
  locale?: HomeLocale;
  indexHref?: string;
  indexLabel?: string;
}

export default function ArticleToolbar({
  locale = "zh-CN",
  indexHref = "/posts",
  indexLabel = "文章",
}: ArticleToolbarProps) {
  const isEnglish = locale === "en";
  const defaultCopyLabel = isEnglish ? "Copy link" : "复制链接";
  const [copyLabel, setCopyLabel] = useState(defaultCopyLabel);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel(isEnglish ? "Link copied" : "链接已复制");
    } catch {
      setCopyLabel(isEnglish ? "Copy the link from the address bar" : "请复制地址栏链接");
    }

    window.setTimeout(() => setCopyLabel(defaultCopyLabel), 1800);
  }

  return (
    <nav className={styles.toolbar} aria-label={isEnglish ? "Article actions" : "文章操作"}>
      <Link href={indexHref} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        {isEnglish ? `All ${indexLabel}` : `全部${indexLabel}`}
      </Link>

      <div className={styles.actions}>
        <a href="#article-content" className={styles.actionLink}>
          {isEnglish ? "Read article" : "阅读正文"} <span aria-hidden="true">↓</span>
        </a>
        <button type="button" className={styles.copyButton} onClick={copyLink}>
          {copyLabel}
        </button>
      </div>
    </nav>
  );
}
