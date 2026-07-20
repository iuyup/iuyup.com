"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./ArticleToolbar.module.css";

export default function ArticleToolbar() {
  const [copyLabel, setCopyLabel] = useState("复制链接");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel("链接已复制");
    } catch {
      setCopyLabel("请复制地址栏链接");
    }

    window.setTimeout(() => setCopyLabel("复制链接"), 1800);
  }

  return (
    <nav className={styles.toolbar} aria-label="文章操作">
      <Link href="/posts" className={styles.backLink}>
        <span aria-hidden="true">←</span>
        全部文章
      </Link>

      <div className={styles.actions}>
        <a href="#article-content" className={styles.actionLink}>
          阅读正文 <span aria-hidden="true">↓</span>
        </a>
        <button type="button" className={styles.copyButton} onClick={copyLink}>
          {copyLabel}
        </button>
      </div>
    </nav>
  );
}
