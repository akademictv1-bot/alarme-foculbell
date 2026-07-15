export type Accent = 'white' | 'black';
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceLight: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentLight: string;
  error: string;
  success: string;
  warning: string;
}

const DARK_PALETTE: ThemeColors = {
  bg: '#09090b',
  surface: '#121214',
  surfaceLight: '#1c1c1f',
  border: '#222225',
  borderLight: '#2c2c30',
  text: '#F3F4F6',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  accentBg: '#1a1a1a',
  accentText: '#ffffff',
  accentBorder: 'rgba(255,255,255,0.3)',
  accentLight: 'rgba(255,255,255,0.1)',
  error: '#f43f5e',
  success: '#10b981',
  warning: '#f59e0b',
};

const LIGHT_PALETTE: ThemeColors = {
  bg: '#ffffff',
  surface: '#f5f5f5',
  surfaceLight: '#e8e8e8',
  border: '#e0e0e0',
  borderLight: '#d0d0d0',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  accentBg: '#ffffff',
  accentText: '#1a1a1a',
  accentBorder: 'rgba(0,0,0,0.15)',
  accentLight: 'rgba(0,0,0,0.05)',
  error: '#f43f5e',
  success: '#10b981',
  warning: '#f59e0b',
};

export function getTheme(accent: Accent): Theme {
  return accent === 'white' ? 'light' : 'dark';
}

export function getThemeColors(accent: Accent): ThemeColors {
  return accent === 'white' ? LIGHT_PALETTE : DARK_PALETTE;
}

export const COLORS: ThemeColors = DARK_PALETTE;
