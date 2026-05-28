export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  onPrimary: string;
}

export const THEME_COLORS: Record<ThemeMode, ThemeTokens> = {
  light: {
    primary: '#2A3F6D',
    primaryDark: '#1E2430',
    accent: '#6B8BBE',
    background: '#F6F5F1',
    backgroundAlt: '#EFEDE6',
    surface: '#FFFFFF',
    border: '#C9CED6',
    text: '#1E2430',
    textMuted: '#4A5D73',
    onPrimary: '#F6F5F1',
  },
  dark: {
    primary: '#93C5FD',
    primaryDark: '#BFDBFE',
    accent: '#60A5FA',
    background: '#1E293B',
    backgroundAlt: '#334155',
    surface: '#0F172A',
    border: '#475569',
    text: '#F8FAFC',
    textMuted: '#CBD5E1',
    onPrimary: '#1E293B',
  },
};
