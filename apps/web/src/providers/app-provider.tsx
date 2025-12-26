import React from 'react';
import { ThemeProvider } from './theme-provider';
import SnackbarProviderCustom from './snackbar-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SnackbarProviderCustom>{children}</SnackbarProviderCustom>
    </ThemeProvider>
  );
}
