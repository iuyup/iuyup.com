import {
  Caveat,
  JetBrains_Mono,
  Noto_Sans_SC,
  Noto_Serif_SC,
  Source_Sans_3,
  Source_Serif_4,
} from "next/font/google";

export const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

export const sourceSans = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  style: "normal",
  display: "swap",
});

export const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  preload: false,
  display: "swap",
});

export const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  preload: false,
  display: "swap",
});

export const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  style: ["normal", "italic"],
  preload: false,
  display: "swap",
});

export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const rootFontVariables = [
  sourceSerif.variable,
  sourceSans.variable,
  notoSerifSC.variable,
  notoSansSC.variable,
  jetBrainsMono.variable,
  caveat.variable,
].join(" ");
