"use client";
import Giscus from "@giscus/react";
import type { HomeLocale } from "@/lib/home-content";

interface CommentsProps {
  locale?: HomeLocale;
}

export default function Comments({ locale = "zh-CN" }: CommentsProps) {
  const isEnglish = locale === "en";

  return (
    <section className="border-t border-[#958C80] pt-8">
      <h2 className="type-heading mb-6 text-2xl font-semibold text-[var(--article-ink)]">
        {isEnglish ? "Discussion" : "讨论"}
      </h2>
      <div className="[&_iframe]:!w-full [&_iframe]:!max-w-full">
        <Giscus
          repo="iuyup/iuyup.com"
          repoId="R_kgDOR_CBoQ"
          category="Announcements"
          categoryId="DIC_kwDOR_CBoc4C6lcr"
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="noborder_light"
          lang={isEnglish ? "en" : "zh-CN"}
          loading="lazy"
        />
      </div>
    </section>
  );
}
