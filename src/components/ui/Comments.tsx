"use client";
import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <section className="border-t border-[#958C80] pt-8">
      <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-[var(--article-ink)]">讨论</h2>
      <div className="[&_iframe]:!w-full [&_iframe]:!max-w-full">
        <Giscus
          repo="iuyup/selfweb"
          repoId="R_kgDOR_CBoQ"
          category="Announcements"
          categoryId="DIC_kwDOR_CBoc4C6lcr"
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="light"
          lang="zh-CN"
        />
      </div>
    </section>
  );
}
