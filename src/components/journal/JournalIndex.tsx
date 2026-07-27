import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import type { ContentItem } from "@/lib/content";
import styles from "@/app/posts/posts.module.css";

interface JournalIndexProps {
  entries: ContentItem[];
  title: string;
  description: string;
  path: string;
  listHeading: string;
}

function formatListDate(date: string | Date) {
  const calendarDate = date instanceof Date ? date.toISOString().slice(0, 10) : String(date).slice(0, 10);
  const calendarMatch = calendarDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (calendarMatch) {
    const [, year, month, day] = calendarMatch;

    return {
      dateTime: calendarDate,
      display: `${year.slice(-2)}/${month}/${day}`,
    };
  }

  const parsedDate = date instanceof Date ? date : new Date(String(date));
  if (Number.isNaN(parsedDate.getTime())) {
    return { dateTime: String(date), display: String(date) };
  }

  const year = String(parsedDate.getUTCFullYear()).slice(-2);
  const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getUTCDate()).padStart(2, "0");

  return {
    dateTime: `${parsedDate.getUTCFullYear()}-${month}-${day}`,
    display: `${year}/${month}/${day}`,
  };
}

export default function JournalIndex({ entries, title, description, path, listHeading }: JournalIndexProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://iuyup.com${path}/${encodeURIComponent(entry.slug)}`,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className={styles.page}>
        <div className={styles.shell}>
          <nav className={styles.toolbar} aria-label={`${title}操作`}>
            <Link href="/">← 首页</Link>
            <a href="/feed.xml">RSS 订阅 ↗</a>
          </nav>
          <div className={styles.rule} />

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <p className={styles.eyebrow}>T. / Journal</p>
              <h1 className={styles.pageTitle}>{title}</h1>
              <p className={styles.intro}>{description}</p>
              <nav className={styles.sideNav} aria-label={`${title}索引`}>
                <a href="#entry-list">
                  <span>全部{title}</span>
                  <span>{entries.length.toString().padStart(2, "0")}</span>
                </a>
                <a href="/feed.xml">RSS 订阅 ↗</a>
                <Link href="/">首页 ↖</Link>
              </nav>
            </aside>

            <section className={styles.postArea} aria-labelledby="entry-list-heading">
              <header className={styles.listHeader}>
                <span id="entry-list-heading">{listHeading}</span>
                <span>{entries.length} 篇</span>
              </header>

              {entries.length === 0 ? (
                <p className={styles.emptyState}>这里暂时还没有公开内容。</p>
              ) : (
                <ol id="entry-list" className={styles.postList}>
                  {entries.map((entry) => {
                    const date = formatListDate(entry.date);

                    return (
                      <li key={entry.slug} className={styles.postItem}>
                        <Link href={`${path}/${encodeURIComponent(entry.slug)}`} className={styles.postLink}>
                          <time className={styles.date} dateTime={date.dateTime}>
                            {date.display}
                          </time>
                          <div className={styles.postBody}>
                            <h2 className={styles.postTitle}>{entry.title}</h2>
                            {entry.summary && <p className={styles.summary}>{entry.summary}</p>}
                          </div>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className={styles.tags} aria-label="内容标签">
                              {entry.tags.map((tag) => (
                                <span key={tag} className={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span className={styles.footerBrand}>T.</span>
            <div className={styles.footerLinks}>
              <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="mailto:tyn2005315@gmail.com">Email</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
