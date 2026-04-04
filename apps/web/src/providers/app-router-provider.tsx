import React from 'react';
import { ThemeProvider } from '@/core/components/theme';
import { Logger } from '@/core/components/logger';
import { logger } from '@/core/services/logger-service';

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
