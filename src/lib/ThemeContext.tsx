import { createContext, use, ReactNode } from 'react';
import { Accent, Theme, ThemeColors, getTheme, getThemeColors } from './theme';

interface ThemeContextValue {
  accent: Accent;
  theme: Theme;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  accent: 'white',
  theme: 'light',
  colors: getThemeColors('white'),
});

export function ThemeProvider({ accent, children }: { accent: Accent; children: ReactNode }) {
  const colors = getThemeColors(accent);
  const theme = getTheme(accent);
  return (
    <ThemeContext value={{ accent, theme, colors }}>
      {children}
    </ThemeContext>
  );
}

export function useThemeColors(): ThemeColors {
  return use(ThemeContext).colors;
}

export function useAccent(): Accent {
  return use(ThemeContext).accent;
}

export function useTheme(): Theme {
  return use(ThemeContext).theme;
}
