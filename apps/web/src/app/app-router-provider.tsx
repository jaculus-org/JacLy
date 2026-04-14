import type React from 'react';
import { Logger, logger, ThemeProvider } from '@/core';

export function AppRouterProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Logger.Provider loggerBusService={logger}>{children}</Logger.Provider>
    </ThemeProvider>
  );
}
