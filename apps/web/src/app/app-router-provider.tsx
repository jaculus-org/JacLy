import React from 'react';
import { Logger, ThemeProvider, logger } from '@/core';

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
