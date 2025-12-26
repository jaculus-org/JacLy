import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Route as RootRoute } from '@/routes/__root';

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

type ThemeProviderState = {
  theme: Theme;
  themeNormalized: ThemeNormalized;
  setTheme: (theme: Theme) => Promise<void>;
};

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const { db } = RootRoute.useRouteContext();
  const dbTheme = useLiveQuery(async () => {
    const row = await db.appSettings.get('theme');
    return (row?.value as Theme | undefined) ?? undefined;
  }, []);

  const [optimisticTheme, setOptimisticTheme] = useState<Theme | null>(null);
  const theme = optimisticTheme ?? dbTheme ?? defaultTheme;

  useEffect(() => {
    const root = window.document.documentElement;

    const apply = () => {
      root.removeAttribute('data-theme');
      root.setAttribute('data-theme', themeNormalized(theme));
    };

    apply();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      themeNormalized: themeNormalized(theme),
      setTheme: async next => {
        setOptimisticTheme(next);
        await db.appSettings.put({
          key: 'theme',
          value: next,
          updatedAt: Date.now(),
        });
      },
    }),
    [theme, db]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeProviderContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
