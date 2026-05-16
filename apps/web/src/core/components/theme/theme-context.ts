import { createContext, useContext } from 'react';

type ThemeNormalized = 'dark' | 'light';
export type Theme = ThemeNormalized | 'system';

export type ThemeProviderState = {
  theme: Theme;
  themeNormalized: ThemeNormalized;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  themeNormalized: 'light',
  setTheme: () => null,
};

export const ThemeContext = createContext<ThemeProviderState>(initialState);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}