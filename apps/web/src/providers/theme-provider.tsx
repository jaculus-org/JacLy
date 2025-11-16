import { storage, STORAGE_KEYS } from '@/lib/storage';
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeNormalized = 'dark' | 'light';
type Theme = ThemeNormalized | 'system';

function themeNormalized(theme: Theme): ThemeNormalized {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  themeNormalized: ThemeNormalized;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  themeNormalized: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = STORAGE_KEYS.THEME,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (storage.get(storageKey, '') as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      root.removeAttribute('data-theme');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';

        root.setAttribute('data-theme', systemTheme);
        return;
      }

      root.setAttribute('data-theme', theme);
    };

    updateTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const value = {
    theme,
    themeNormalized: themeNormalized(theme),
    setTheme: (theme: Theme) => {
      storage.set(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
