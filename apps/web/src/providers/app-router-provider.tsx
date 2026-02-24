import React from 'react';
import { ThemeProvider } from '@/features/theme';

export function AppRouterProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
