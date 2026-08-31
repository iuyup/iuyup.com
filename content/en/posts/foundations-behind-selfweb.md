---
title: The Foundations I Added to selfweb, Starting with a Background Image
date: 2026-07-28
summary: From homepage background loading and a shared system for articles and Notes to Sanity publishing and cache revalidation, this update filled in several links that are most likely to break when a personal website is meant to support long-term writing.
sourceSlug: 从一张背景图开始_最近给selfweb补的几块地基
tags:
  - Personal Website
  - Next.js
  - Sanity
  - Performance Optimization
---

# The Foundations I Added to selfweb, Starting with a Background Image

> This round of changes began with a simple goal: make the Monet background image on the homepage load faster. As I kept investigating, I realized that the real gaps were not in any single component. They were several missing connections between a personal website that “opens” and one that can support writing and maintenance over the long term.

When a personal website has just been built, many problems are not obvious. The homepage opens, cards flip, and articles can be written. It is only after opening it frequently, viewing it on a phone, and preparing to update it continuously that the small things holding it back start to show: the above-the-fold image is slow, content depends entirely on local Markdown, newly published articles still have to wait for a cache to expire, and it is unclear whether RSS and the sitemap have caught up.

I did not redesign the visuals this time, nor did I introduce a heavy architecture. Most of the work was about turning several places that were “temporarily usable” into something that could keep working over time.

---

## The Slowest Thing on the Homepage Is Often the Most Visible

The homepage background is a painting that fills the entire screen. It defines the atmosphere visitors see first, but it also naturally becomes the largest resource above the fold.

The previous approach was straightforward: use a large image and let it cover the screen. The problem was just as straightforward—the browser first had to download a fairly large original before it could finish rendering the first screen. A background image is not an ordinary illustration that can simply be cropped into a tiny thumbnail. Once its aspect ratio is wrong, the entire painting is stretched, and the most noticeable part of the page becomes distorted.

In the end, I did not take the “replace it with a smaller image” route. I kept the aspect ratio required by the full-screen background and prepared a `3840px` version suitable for the web. The file went from nearly 7 MB to about 2.3 MB while still covering large displays.

I also replaced the ordinary image rendering with Next.js `Image`:

```tsx
<Image
  src={monetBackground}
  alt=""
  fill
  preload
  sizes="100vw"
  quality={75}
  className="object-cover"
/>
```

Each of these settings has one job:

- `fill + object-cover` keeps the image proportional while covering the full screen, rather than stretching it;
- `sizes="100vw"` tells the browser explicitly that the image spans the viewport width, preventing it from choosing a resource for the wrong size;
- `preload` places the above-the-fold background earlier in the loading queue;
- `quality={75}` reduces the file size further without making the painting look blurry.

It is difficult to summarize this kind of optimization with a single “X percent faster” figure, because network conditions, devices, and caches all affect the result. After the change, however, the browser no longer treated the original large image as an ordinary static file to wait on. The most important above-the-fold resource now had explicit priority and sizing information. For this website, that was more valuable than adding more animation.

---

## Articles and “Notes” Should Not Become Two Different Page Systems

The next thing I worked on was “Notes.”

It began as a simple idea: articles are better suited to complete technical write-ups, but many scattered thoughts, reading notes, and fragments from an internship are not worth forcing into a long article. Without a low-pressure outlet, they usually remain in Obsidian and are gradually forgotten.

The easiest implementation would have been to duplicate the article index and detail pages, change the copy, and connect a `notes` directory. That would have been quick in the short term, but it would inevitably create problems later: SEO gets fixed on the article page but is forgotten on Notes; articles gain RSS while Notes do not; and dates, indexes, and back links slowly drift apart.

So instead of copying pages, I first extracted a shared `ContentCollection`. Articles and Notes are simply two types of content, both using the same reading, sorting, detail-page, and index components underneath:

```text
posts  ─┐
        ├─ ContentCollection / JournalIndex / JournalEntry
notes  ─┘
```

The result is not that the “code is more sophisticated,” but that a small detail only needs to be changed once in the future. Articles and Notes can have different names, entry points, and tones, but their reading experience should remain consistent.

Along the way, I also added a homepage entry, RSS, and sitemap coverage. Notes are no longer a page hidden behind some route. Like articles, they now appear in the content stream, subscription feed, and search-engine sitemap.

---

## Static Caching Should Not Mean “Wait a While After Publishing”

Content websites are well suited to static caching. Most readers see the same article, so there is no need to fetch it again from the CMS on every visit. The problem is that if the only strategy is “cache for one hour,” the writing experience becomes frustrating: I publish a new Note, open the website, and still see nothing, with no way to tell whether publishing failed or the cache simply has not expired.

The current strategy has two layers:

1. Under normal conditions, articles and Notes are statically cached for one hour;
2. When content is published, updated, or deleted in Sanity, a webhook calls the website's revalidation endpoint and actively refreshes the relevant pages.

The refresh scope includes more than a single detail page. It also covers the homepage, article index, Notes index, RSS, and sitemap. This avoids hard-to-explain states such as a detail page showing the new content while its homepage card remains stale.

The development environment does not retain this cache layer. While writing content or changing the schema, it reads the latest data directly, preventing an empty cached result from making me think my code is broken during local debugging.

What mattered to me in this process was that caching should make the site faster for readers, not more confusing for the author. Time-based caching controls the cost of visits; invalidating on publication keeps updates timely. These are best handled separately.

---

## Moving from Markdown to Sanity Did Not Mean Handing Writing over to a Backend

Once Notes existed, the limitations of local Markdown became more obvious.

Markdown is great for writing in an editor and for version control. But if every publication requires opening the project, creating a file, writing front matter, committing to Git, and waiting for a Vercel deployment, it feels more like a development workflow than a writing workflow. Notes in particular are supposed to remain lightweight.

So I migrated the content to Sanity, but I did not discard Markdown all at once.

Sanity defines one unified content schema: title, URL identifier, publication date, update date, summary, tags, cover image, and body. Articles and Notes share these base fields and are distinguished only by type. The existing Markdown is first previewed through a migration script and written only after confirmation. If the website cannot read from the CMS, it still falls back to local Markdown.

That fallback may look conservative, but I think it is necessary. Content on a personal website should not disappear entirely because the CMS is temporarily unreachable, an environment variable is misconfigured, or a migration missed some data. Sanity is the new publishing entry point; Markdown remains the local backup and fallback for the content.

Finally, I embedded Studio at `/studio`. Publishing a Note no longer requires going through GitHub or redeploying the website. I can open the Studio, fill in the title, URL, date, summary, tags, and body, then publish. Once publication succeeds, a webhook tells the website to refresh its cache, and the content on the public site updates.

This was not about trying to give the site “a backend like a large website.” It was about separating writing from the deployment process. Content deserves an entry point of its own.

---

## SEO Is Not Keyword Stuffing; It Is Giving Content the Right Exits

My previous understanding of SEO was a little crude: if a page could be found in search, that was probably enough. Once I started filling in the details, I realized that SEO is more about defining boundaries between pieces of content.

This round added several fundamentals:

- Pages have stable canonical URLs so the same content is not treated as multiple copies under different URLs;
- `robots.txt` points to the sitemap;
- The sitemap includes articles, Notes, and each of their detail pages, using the publication or update date as `lastModified`;
- RSS places both content types in one feed while preserving their “Article / Notes” categories;
- Dates use a consistent year-month-day display instead of placing the CMS's full timestamp directly on the reading page.

Readers may not see these things directly, but they determine whether search engines, RSS readers, and shared links see a complete website. SEO on a personal site does not need to be complicated. At minimum, every piece of content should have one unique address, an accurate title, summary, date, and a discoverable path.

---

## What This Round of Changes Left Behind

Looking back, the starting point was simply a slow-loading homepage background. What remained afterward was much more than a compressed image:

- The homepage's largest resource now has a more appropriate loading strategy;
- Articles and Notes share one reading and indexing structure;
- Content can be published from Sanity while retaining local Markdown as a fallback;
- The cache is actively refreshed on publication instead of relying only on passive waiting;
- RSS, sitemap, metadata, and date formatting all support the new content type.

Of course, the website is not yet at the point where “nothing needs attention.” The guestbook's administration entry point, the CMS editing experience, and mobile details all still have room for improvement. But after this round, selfweb is at least no longer a one-off showcase. It has started to develop a basic rhythm suited to continuous writing and maintenance.

I now prefer this way of making changes: instead of trying to complete every feature at once, I start with a real point of friction, follow it downward, and find the layer where the fix belongs. A slow background image looks like an image problem on the surface. Continuing downward eventually led to the content, cache, and publishing pipeline.

That is probably how a personal website grows—slowly, one piece at a time.

---

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agents*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
