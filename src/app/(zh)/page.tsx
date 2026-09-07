import { getAllPosts } from "@/lib/posts";
import HomeLanding from "@/components/home/HomeLanding";
import { SITE_URL } from "@/lib/site";

export default async function Home() {
  const posts = await getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "iuyup",
    url: SITE_URL,
  };

  return <HomeLanding locale="zh-CN" posts={posts} jsonLd={jsonLd} />;
}
