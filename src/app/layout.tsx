import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Chat from "@/components/chat/Chat";

export const metadata: Metadata = {
  metadataBase: new URL("https://iuyup.com"),
  title: {
    default: "T | Builder & Explorer",
    template: "%s | T",
  },
  description: "AI Agent 开发者 · 光电信息科学与工程 · 汕头大学",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "T",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "T",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@iuyup",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "https://iuyup.com/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Chat />
      </body>
    </html>
  );
}
