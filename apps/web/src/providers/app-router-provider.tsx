import React from 'react';
import { ThemeProvider } from '@/features/theme';
import { Logger } from '@/features/logger';
import { logger } from '@/services/logger-service';

export function AppRouterProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <Logger.Provider loggerBusService={logger}>{children}</Logger.Provider>
    </ThemeProvider>
  );
}
