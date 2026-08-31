import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import FloatingControls from "@/components/ui/FloatingControls";
import Chat from "@/components/chat/Chat";
import { DEFAULT_OG_IMAGE_PATH, RSS_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "iuyup",
    template: "%s | iuyup",
  },
  description: "AI Agent 开发者 · 光电信息科学与工程 · 汕头大学",
  openGraph: {
    type: "website",
    url: SITE_URL,
    locale: "zh_CN",
    siteName: "iuyup",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "iuyup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@iuyup",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
      en: "/en",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": RSS_URL,
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
        <ThemeProvider>
          {children}
          <FloatingControls />
        </ThemeProvider>
        <Chat />
      </body>
    </html>
  );
}
