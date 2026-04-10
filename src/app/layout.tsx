import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T — Builder & Explorer",
  description: "AI Agent 开发者 · 光电信息科学与工程 · 汕头大学",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
