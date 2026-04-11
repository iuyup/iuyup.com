"use client";
import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <section className="max-w-3xl mx-auto px-6 mt-16 pt-8 border-t border-[#D5CEC7]">
      <h2 className="font-caveat text-3xl text-[#6B8DAE] mb-6">Discussion</h2>
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
