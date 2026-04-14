export const CARD_VARIANTS = {
  Chat: {
    bg: 'rgba(138, 154, 168, 0.15)',
    textSecondary: '#9a9a9a',
  },
  Guestbook: {
    bg: 'rgba(107, 141, 174, 0.15)',
    textSecondary: '#9a9a9a',
  },
  project: {
    bg: 'rgba(162, 171, 158, 0.15)',
    textSecondary: '#9a9a9a',
  },
  default: {
    bg: 'rgba(214, 207, 199, 0.18)',
    textSecondary: '#3a3a3a',
  },
  blog: {
    bg: 'rgba(212, 133, 106, 0.18)',
    textSecondary: '#5a5a5a',
  },
} as const;

/** project.color → rgba background for ProjectCard */
export function projectBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.15)`;
}

export type CardVariant = keyof typeof CARD_VARIANTS;
