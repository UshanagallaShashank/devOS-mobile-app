import { Platform } from 'react-native';

export const C = {
  bg:      '#07070E',
  surface: '#0E0E1A',
  card:    '#131320',
  border:  '#1C1C2E',
  primary: '#6366F1',
  accent:  '#10B981',
  warn:    '#F59E0B',
  danger:  '#EF4444',
  purple:  '#8B5CF6',
  pink:    '#EC4899',
  text:    '#F0F2FF',
  sub:     '#8B90B8',
  muted:   '#3D4166',
} as const;

export const TAG_COLORS: Record<string, string> = {
  DSA:    C.purple,
  Learn:  C.accent,
  Jobs:   C.warn,
  Resume: C.pink,
  Other:  C.sub,
};

export const glow = (color: string, opacity = 0.3) =>
  Platform.select({
    ios: {
      shadowColor:  color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: opacity,
      shadowRadius:  16,
    },
    android: { elevation: 10 },
  }) ?? {};
