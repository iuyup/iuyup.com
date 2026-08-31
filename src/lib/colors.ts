export const CARD_VARIANTS = {
  Chat: {
    bg: 'rgba(180, 200, 220, 0.65)',
    textSecondary: '#3a3a3a',
  },
  Guestbook: {
    bg: 'rgba(180, 200, 220, 0.65)',
    textSecondary: '#3a3a3a',
  },
  project: {
    bg: 'rgba(190, 210, 190, 0.65)',
    textSecondary: '#3a3a3a',
  },
  default: {
    bg: 'linear-gradient(rgba(245, 240, 230, 0.75), rgba(245, 240, 230, 0.75))',
    textSecondary: '#3a3a3a',
  },
  blog: {
    bg: 'rgba(230, 190, 180, 0.65)',
    textSecondary: '#3a3a3a',
  },
} as const;

/** project.color → rgba background for ProjectCard */
export function projectBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.65)`;
}

export type CardVariant = keyof typeof CARD_VARIANTS;
