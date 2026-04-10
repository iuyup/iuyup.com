# Personal Website

## 1. Concept & Vision

一个具有手绘插画风格的个人网站，灵感来源于 Anthropic 品牌视觉语言。整体风格：低饱和度配色、手绘线条感、扁平插画、留白充足。拒绝渐变、3D效果、高饱和色彩。

## 2. Design Language

- **Aesthetic**: Organic minimalism / hand-drawn editorial style, inspired by Anthropic's visual identity
- **Color Palette** (muted, desaturated tones):
  - Background: `#F5F0EB` (warm beige)
  - Surface: `#E8E2DA` (darker beige, for cards)
  - Primary: `#6B8DAE` (muted blue, like image 2)
  - Secondary: `#B8C5C4` (muted sage green, like image 3)
  - Accent: `#D4856A` (muted coral/terracotta, like image 1)
  - Text: `#2C2C2C` (near-black, NOT pure black)
  - Text Secondary: `#6B6B6B` (medium gray)
- **Typography**:
  - English headings: `Caveat` (handwritten, Google Fonts)
  - Chinese body: `Noto Sans SC` weight 400/500
  - English body: `Inter`
- **Illustration Style**: Hand-drawn SVG with irregular strokes, limited 2-3 colors per illustration, no shadows or gradients
- **Motion**: Subtle only — gentle fade-in on scroll, soft hover opacity changes. No bouncing, no sliding, no parallax.
- **Spacing**: Generous whitespace. When in doubt, add more padding.

## 3. Layout & Structure

- **Navigation**: Top nav bar, minimal — name on left, page links on right
- **Hero**: Full-height intro with name (Caveat font, large), one-line tagline, muted background
- **About**: Brief personal introduction
- **Projects**: Featured work cards (AgentFlow, RAG 2.0, Auto-Tweet Agent)
- **Music**: Embedded Spotify/Apple Music playlist area
- **Agent Chat**: Chat interface to talk with personal AI agent (calls Anthropic API via API Route)
- **Discussion**: Giscus comment section (GitHub Discussions based)

## 4. Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Google Fonts (Caveat, Noto Sans SC, Inter)

## 5. Design Rules (MUST follow)

- NEVER use pure black (`#000000`) or pure white (`#FFFFFF`)
- NEVER use high-saturation colors or gradients
- NEVER use box-shadow heavier than `0 1px 3px rgba(0,0,0,0.08)`
- ALL borders should be subtle: 1px, using `#D5CEC7` or similar muted tone
- Buttons: filled with muted colors, rounded-lg, no sharp corners
- Icons: prefer hand-drawn SVG style over geometric icons
- Images: if using photos, apply a slight desaturation filter

## 6. Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```