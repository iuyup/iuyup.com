import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconBrandGithub,
  IconMail,
  IconRss,
  IconSparkles,
} from "@tabler/icons-react";
import { externalFeeds, siteProfile, siteTimeline } from "@/lib/about";
import monetBackground from "@/assets/monet-background-3840.jpg";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 iuyup、正在关心的事情，以及这处小站的更新记录。",
  openGraph: {
    title: "关于 | iuyup",
    description: "关于 iuyup、正在关心的事情，以及这处小站的更新记录。",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "关于 iuyup" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "关于 | iuyup",
    description: "关于 iuyup、正在关心的事情，以及这处小站的更新记录。",
  },
  alternates: {
    canonical: "/about",
    types: {
      "application/rss+xml": "https://iuyup.com/feed.xml",
    },
  },
};

const interests = ["AI Agent 与开源项目", "把技术问题写清楚", "R&B、Neo-soul 和 Jazz", "吉他、乐队与一段段日常"];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <Image
          src={monetBackground}
          alt=""
          fill
          preload
          sizes="100vw"
          quality={75}
          className="object-cover"
          style={{ filter: "saturate(0.7)" }}
        />
        <div className={styles.backgroundOverlay} />
      </div>

      <div className={styles.pageContent}>
        <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          T.
        </Link>
        <nav className={styles.nav} aria-label="页面导航">
          <Link href="/">首页</Link>
          <Link href="/posts">文章</Link>
          <a href={siteProfile.feedPath}>RSS</a>
        </nav>
        </header>

        <div className={styles.rule} />

        <div className={styles.shell}>
        <article className={styles.content}>
          <p className={styles.eyebrow}>T. / About</p>
          <h1 className={styles.title}>关于这个人，也关于这处小站。</h1>
          <p className={styles.lead}>
            这里原本只是一个把想法放下来的地方。后来它慢慢装下了正在学的技术、做过的项目，和一些不急着变成结论的日常。
          </p>

          <section className={styles.section} aria-labelledby="about-me">
            <div className={styles.sectionHeading}>
              <span>01</span>
              <h2 id="about-me">自述</h2>
            </div>
            <div className={styles.prose}>
              <p>
                你好，我是 T.，目前在汕头大学学习光电信息科学与工程。相比给自己贴一个很确定的标签，我更愿意把时间放在持续学习上：读代码、做一点 AI 开发，也试着理解 Agent 能真正帮人完成什么。
              </p>
              <p>
                我不打算把这里写成一份简历。技术文章、项目记录和随心片段会并排出现；它们共同构成我此刻的兴趣，也留下以后回头看时能够辨认的轨迹。
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="interests">
            <div className={styles.sectionHeading}>
              <span>02</span>
              <h2 id="interests">最近在关心</h2>
            </div>
            <ul className={styles.interestList}>
              {interests.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="rss">
            <div className={styles.sectionHeading}>
              <span>03</span>
              <h2 id="rss">订阅</h2>
            </div>
            <div className={styles.feedCard}>
              <div className={styles.feedIcon} aria-hidden="true">
                <IconRss size={22} stroke={1.6} />
              </div>
              <div>
                <p className={styles.feedTitle}>本站 RSS</p>
                <p className={styles.feedDescription}>文章与随心都会出现在同一条订阅中。</p>
                <a href={siteProfile.feedPath} className={styles.feedUrl}>
                  {siteProfile.feedLabel}
                  <IconArrowUpRight size={15} stroke={1.8} aria-hidden="true" />
                </a>
              </div>
            </div>

            {externalFeeds.length > 0 ? (
              <div className={styles.externalFeeds}>
                <p className={styles.externalIntro}>也在读这些站点：</p>
                <ul>
                  {externalFeeds.map((feed) => (
                    <li key={feed.href}>
                      <a href={feed.href} target="_blank" rel="noopener noreferrer">
                        <span>
                          <strong>{feed.name}</strong>
                          <small>{feed.description}</small>
                        </span>
                        <IconArrowUpRight size={16} stroke={1.8} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.feedNote}>
                外部订阅会只保留真正长期阅读的站点，之后在这里慢慢补齐。
              </p>
            )}
          </section>

          <section className={`${styles.section} ${styles.contactSection}`} aria-labelledby="contact">
            <div className={styles.sectionHeading}>
              <span>04</span>
              <h2 id="contact">联系</h2>
            </div>
            <p className={styles.contactText}>如果你也在做有意思的事，欢迎随时来聊。</p>
            <div className={styles.contactLinks}>
              <a href="https://github.com/iuyup" target="_blank" rel="noopener noreferrer">
                <IconBrandGithub size={18} stroke={1.8} aria-hidden="true" />
                GitHub
                <IconArrowUpRight size={14} stroke={1.8} aria-hidden="true" />
              </a>
              <a href="mailto:tyn2005315@gmail.com">
                <IconMail size={18} stroke={1.8} aria-hidden="true" />
                Email
                <IconArrowUpRight size={14} stroke={1.8} aria-hidden="true" />
              </a>
            </div>
          </section>
        </article>

        <aside className={styles.timeline} aria-labelledby="timeline-heading">
          <div className={styles.timelineHeading}>
            <IconSparkles size={18} stroke={1.7} aria-hidden="true" />
            <div>
              <p>Site log</p>
              <h2 id="timeline-heading">站点变更</h2>
            </div>
          </div>
          <ol className={styles.timelineList}>
            {siteTimeline.map((entry) => (
              <li key={`${entry.date}-${entry.title}`}>
                <time dateTime={entry.date}>{entry.date.replaceAll("-", ".")}</time>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
              </li>
            ))}
          </ol>
        </aside>
        </div>

        <footer className={styles.footer}>
          <span>© 2026 iuyup</span>
          <Link href="/">回到首页 ↖</Link>
        </footer>
      </div>
    </main>
  );
}
