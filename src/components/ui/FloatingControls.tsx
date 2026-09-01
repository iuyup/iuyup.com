"use client";

import { IconLanguage } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getEnglishSlug,
  getSourceSlug,
  type TranslatedCollection,
} from "@/lib/content-translations";
import styles from "./FloatingControls.module.css";

const IDLE_DELAY_MS = 1100;
const CLOSE_DELAY_MS = 220;
const SITE_VIEWS_OWNER_HASH_PREFIX = "#site-views-owner=";
const HOME_PAGE_PATHS = new Set(["/", "/en"]);

function isMainLandingPath(pathname: string) {
  return HOME_PAGE_PATHS.has(pathname);
}

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
    return { chinese: pathname, english: englishPost, hasPair: true };
  }
  if (chinesePost) {
    return { chinese: chinesePost, english: pathname, hasPair: true };
  }

  const englishNote = translatedEntryHref(pathname, "notes", "toEnglish");
  const chineseNote = translatedEntryHref(pathname, "notes", "toChinese");
  if (englishNote) {
    return { chinese: pathname, english: englishNote, hasPair: true };
  }
  if (chineseNote) {
    return { chinese: chineseNote, english: pathname, hasPair: true };
  }

  return { chinese: pathname.startsWith("/en") ? "/" : pathname, english: "/en", hasPair: false };
}

function journalTargetId(pathname: string) {
  const isJournalDetail =
    routeSlug(pathname, "/posts") !== null ||
    routeSlug(pathname, "/notes") !== null ||
    routeSlug(pathname, "/en/posts") !== null ||
    routeSlug(pathname, "/en/notes") !== null;

  return isJournalDetail ? "article-content" : undefined;
}

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

function isSiteViewsResponse(value: unknown): value is { total: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "total" in value &&
    typeof value.total === "number" &&
    Number.isSafeInteger(value.total) &&
    value.total >= 0
  );
}

function siteViewsOwnerTokenFromHash() {
  if (!window.location.hash.startsWith(SITE_VIEWS_OWNER_HASH_PREFIX)) {
    return null;
  }

  try {
    return decodeURIComponent(window.location.hash.slice(SITE_VIEWS_OWNER_HASH_PREFIX.length));
  } catch {
    return null;
  }
}

function clearSiteViewsOwnerHash() {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

function formatSiteViews(total: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(total);
}

interface FloatingControlsForPathProps {
  pathname: string;
}

function FloatingControlsForPath({ pathname }: FloatingControlsForPathProps) {
  const targetId = journalTargetId(pathname);
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const hrefs = languageHrefs(pathname);
  const isChineseJournalEntry =
    !isEnglish &&
    (routeSlug(pathname, "/posts") !== null || routeSlug(pathname, "/notes") !== null);

  const [progress, setProgress] = useState(0);
  const [idle, setIdle] = useState(false);
  const [progressHovered, setProgressHovered] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [languagePanelOpen, setLanguagePanelOpen] = useState(false);
  const [siteViews, setSiteViews] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const progressButtonRef = useRef<HTMLButtonElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const idleTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const pointerType = useRef("");
  const actionsWereOpenOnPointerDown = useRef(false);
  const suppressNextFocusOpen = useRef(false);

  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  }, [isEnglish]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSiteViews() {
      const ownerToken = siteViewsOwnerTokenFromHash();
      const response = ownerToken
        ? await fetch("/api/site-views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "exclude-owner", token: ownerToken }),
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          })
        : await fetch("/api/site-views", {
            method: isMainLandingPath(pathname) ? "POST" : "GET",
            ...(isMainLandingPath(pathname)
              ? {
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "record", pathname }),
                }
              : {}),
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          });

      if (!response.ok || controller.signal.aborted) {
        return;
      }

      const data: unknown = await response.json().catch(() => null);
      if (isSiteViewsResponse(data) && !controller.signal.aborted) {
        setSiteViews(data.total);
      }

      if (ownerToken && !controller.signal.aborted) {
        clearSiteViewsOwnerHash();
      }
    }

    void loadSiteViews().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Site views request failed:", error);
      }
    });

    return () => controller.abort();
  }, [pathname]);

  useEffect(() => {
    let animationFrame = 0;

    function clearIdleTimer() {
      if (idleTimer.current !== null) {
        window.clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    }

    function updateProgress() {
      setProgress(getReadingProgress(targetId));
    }

    function settle() {
      const nextProgress = getReadingProgress(targetId);
      setProgress(nextProgress);
      setIdle(nextProgress > 0);
    }

    function handleScroll() {
      updateProgress();
      setIdle(false);
      clearIdleTimer();
      idleTimer.current = window.setTimeout(settle, IDLE_DELAY_MS);
    }

    function handleResize() {
      updateProgress();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    animationFrame = window.requestAnimationFrame(updateProgress);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      clearIdleTimer();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname, targetId]);

  useEffect(() => {
    if (!actionsOpen && !languagePanelOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setLanguagePanelOpen(false);
        setActionsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (languagePanelOpen) {
        setLanguagePanelOpen(false);
        setActionsOpen(true);
        languageButtonRef.current?.focus();
        return;
      }

      setActionsOpen(false);
      if (document.activeElement !== progressButtonRef.current) {
        suppressNextFocusOpen.current = true;
        progressButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionsOpen, languagePanelOpen]);

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const currentLanguage = isEnglish ? "English" : "中文";
  const showArrow = idle || progressHovered || actionsOpen;
  const progressLabel = isEnglish
    ? `Reading progress ${progress}%. Back to the top`
    : `阅读进度 ${progress}%，回到顶部`;
  const siteViewsValue = siteViews === null ? "—" : formatSiteViews(siteViews, isEnglish ? "en" : "zh-CN");
  const siteViewsLabel =
    siteViews === null
      ? isEnglish
        ? "Site page views are unavailable"
        : "站点浏览量暂不可用"
      : isEnglish
        ? `Site page views ${siteViews.toLocaleString("en")}`
        : `站点浏览量 ${siteViews.toLocaleString("zh-CN")}`;

  function clearCloseTimer() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || languagePanelOpen) {
      return;
    }

    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      if (!rootRef.current?.contains(document.activeElement)) {
        setActionsOpen(false);
      }
    }, CLOSE_DELAY_MS);
  }

  function handleRootPointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      clearCloseTimer();
    }
  }

  function handleRootBlur(event: ReactFocusEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setLanguagePanelOpen(false);
    setActionsOpen(false);
  }

  function handleRootFocus() {
    if (suppressNextFocusOpen.current && document.activeElement === progressButtonRef.current) {
      suppressNextFocusOpen.current = false;
      return;
    }

    suppressNextFocusOpen.current = false;
    setActionsOpen(true);
  }

  function handleProgressPointerEnter(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") {
      return;
    }

    clearCloseTimer();
    setProgressHovered(true);
    setActionsOpen(true);
  }

  function handleProgressPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    pointerType.current = event.pointerType;
    actionsWereOpenOnPointerDown.current = actionsOpen;
  }

  function handleProgressClick(event: ReactMouseEvent<HTMLButtonElement>) {
    const isTouchClick = pointerType.current !== "mouse" && event.detail > 0;
    if (isTouchClick && !actionsWereOpenOnPointerDown.current) {
      setActionsOpen(true);
      return;
    }

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  }

  function closeLanguageMenu() {
    setLanguagePanelOpen(false);
    setActionsOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${actionsOpen ? styles.actionsOpen : ""}`}
      onPointerEnter={handleRootPointerEnter}
      onPointerLeave={scheduleClose}
      onFocusCapture={handleRootFocus}
      onBlurCapture={handleRootBlur}
    >
      <button
        ref={progressButtonRef}
        type="button"
        className={`${styles.controlButton} ${styles.progressButton} ${showArrow ? styles.showArrow : ""}`}
        aria-label={progressLabel}
        aria-expanded={actionsOpen}
        aria-controls="floating-control-actions"
        onClick={handleProgressClick}
        onKeyDown={() => {
          pointerType.current = "keyboard";
        }}
        onPointerDown={handleProgressPointerDown}
        onPointerEnter={handleProgressPointerEnter}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            setProgressHovered(false);
          }
        }}
      >
        <svg className={styles.ring} viewBox="0 0 56 56" aria-hidden="true">
          <circle className={styles.indicator} cx="28" cy="28" r="25.25" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} />
        </svg>
        <span className={styles.center}>
          <span className={styles.percentage}>{progress}%</span>
          <svg className={styles.arrow} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M7 8h18M16 25V13M10 19l6-6 6 6" />
          </svg>
        </span>
      </button>

      <span className={styles.hoverBridge} aria-hidden="true" />

      <div id="floating-control-actions" aria-hidden={!actionsOpen}>
        <div className={styles.pageviewsAction} aria-label={siteViewsLabel} role="status">
          <span className={styles.pageviewsNumber}>{siteViewsValue}</span>
          <span className={styles.pageviewsLabel}>{isEnglish ? "Views" : "浏览量"}</span>
        </div>

        <div id="floating-language-action" className={styles.languageAction}>
          <button
            ref={languageButtonRef}
            type="button"
            className={`${styles.controlButton} ${styles.languageButton} ${languagePanelOpen ? styles.languageButtonOpen : ""}`}
            aria-label={
              isEnglish
                ? `Choose language, current language is ${currentLanguage}`
                : `切换语言，当前语言为${currentLanguage}`
            }
            aria-expanded={languagePanelOpen}
            aria-controls="language-switcher-options"
            tabIndex={actionsOpen ? 0 : -1}
            onClick={() => {
              setActionsOpen(true);
              setLanguagePanelOpen((value) => !value);
            }}
          >
            <IconLanguage size={27} stroke={1.65} aria-hidden="true" />
          </button>

          <nav
            id="language-switcher-options"
            className={`${styles.panel} ${languagePanelOpen ? styles.panelOpen : ""}`}
            aria-label={isEnglish ? "Choose language" : "选择语言"}
            aria-hidden={!languagePanelOpen}
          >
            <Link
              href={hrefs.chinese}
              hrefLang="zh-CN"
              lang="zh-CN"
              className={`${styles.option} ${!isEnglish ? styles.active : ""}`}
              aria-current={!isEnglish ? "page" : undefined}
              tabIndex={languagePanelOpen ? 0 : -1}
              onClick={closeLanguageMenu}
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
              tabIndex={languagePanelOpen ? 0 : -1}
              onClick={closeLanguageMenu}
            >
              <span>English</span>
              {isEnglish ? (
                <span className={styles.currentMark}>Current</span>
              ) : isChineseJournalEntry && !hrefs.hasPair ? (
                <span className={styles.pendingMark}>文章筹备中</span>
              ) : null}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function FloatingControls() {
  const pathname = usePathname();

  if (pathname.startsWith("/studio")) {
    return null;
  }

  return <FloatingControlsForPath key={pathname} pathname={pathname} />;
}
