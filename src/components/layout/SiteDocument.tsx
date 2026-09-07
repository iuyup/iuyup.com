import "@/app/globals.css";
import { rootFontVariables } from "@/app/fonts";
import FloatingControls from "@/components/ui/FloatingControls";
import type { HomeLocale } from "@/lib/home-content";

export default function SiteDocument({ children, locale }: { children: React.ReactNode; locale: HomeLocale }) {
  return (
    <html lang={locale} className={rootFontVariables} data-theme="light" data-scroll-behavior="smooth">
      <body>
        {children}
        <FloatingControls />
      </body>
    </html>
  );
}
