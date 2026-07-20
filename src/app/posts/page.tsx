import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import JsonLd from "@/components/JsonLd";
import styles from "./posts.module.css";

export const metadata: Metadata = {
  title: "博客",
  description: "关于 AI Agent、开源与技术思考",
  openGraph: {
    title: "博客 | T",
    description: "关于 AI Agent、开源与技术思考",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "博客" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "博客 | T",
    description: "关于 AI Agent、开源与技术思考",
  },
};

export default function PostsPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "博客列表",
    description: "关于 AI Agent、开源与技术思考",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://iuyup.com/posts/${encodeURIComponent(post.slug)}`,
    })),
  };

  function formatListDate(date: string | Date) {
    const parsedDate = date instanceof Date ? date : new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return { dateTime: String(date), display: String(date) };
    }

    const year = String(parsedDate.getUTCFullYear()).slice(-2);
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getUTCDate()).padStart(2, "0");

    return { dateTime: `${parsedDate.getUTCFullYear()}-${month}-${day}`, display: `${year}/${month}/${day}` };
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className={styles.page}>
        <div className={styles.shell}>
          <nav className={styles.toolbar} aria-label="博客操作">
            <Link href="/">← 首页</Link>
            <a href="/feed.xml">RSS 订阅 ↗</a>
          </nav>
          <div className={styles.rule} />

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <p className={styles.eyebrow}>T. / Journal</p>
              <h1 className={styles.pageTitle}>文章</h1>
              <p className={styles.intro}>关于 AI Agent、开源与技术思考。</p>
              <nav className={styles.sideNav} aria-label="文章索引">
                <a href="#post-list">
                  <span>全部文章</span>
                  <span>{posts.length.toString().padStart(2, "0")}</span>
                </a>
                <a href="/feed.xml">RSS 订阅 ↗</a>
              </nav>
            </aside>

            <section className={styles.postArea} aria-labelledby="post-list-heading">
              <header className={styles.listHeader}>
                <span id="post-list-heading">Recent Writing</span>
                <span>{posts.length} 篇</span>
              </header>

              <ol id="post-list" className={styles.postList}>
                {posts.map((post) => {
                  const date = formatListDate(post.date);

                  return (
                  <li key={post.slug} className={styles.postItem}>
                    <Link href={`/posts/${encodeURIComponent(post.slug)}`} className={styles.postLink}>
                      <time className={styles.date} dateTime={date.dateTime}>
                        {date.display}
                      </time>
                      <div className={styles.postBody}>
                        <h2 className={styles.postTitle}>{post.title}</h2>
                        {post.summary && <p className={styles.summary}>{post.summary}</p>}
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className={styles.tags} aria-label="文章标签">
                          {post.tags.map((tag) => (
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
