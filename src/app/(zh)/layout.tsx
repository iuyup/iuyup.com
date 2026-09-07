import SiteDocument from "@/components/layout/SiteDocument";
export { siteMetadata as metadata } from "@/lib/site-metadata";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="zh-CN">{children}</SiteDocument>;
}
