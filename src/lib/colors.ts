export const CARD_VARIANTS = {
  Chat: {
    bg: 'rgba(138, 154, 168, 0.45)',
    textSecondary: '#787878',
  },
  Guestbook: {
    bg: 'rgba(107, 141, 174, 0.45)',
    textSecondary: '#787878',
  },
  project: {
    bg: 'rgba(162, 171, 158, 0.45)',
    textSecondary: '#787878',
  },
  default: {
    bg: 'rgba(214, 207, 199, 0.55)',
    textSecondary: '#6B6B6B',
  },
  blog: {
    bg: 'rgba(212, 133, 106, 0.35)',
    textSecondary: '#787878',
  },
} as const;

/** project.color → rgba background for ProjectCard */
export function projectBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.35)`;
}

export type CardVariant = keyof typeof CARD_VARIANTS;
