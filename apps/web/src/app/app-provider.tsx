import React from 'react';
import SnackbarProviderCustom from '@/app/snackbar-provider';
import { PwaInstall } from '@/core';
import { TooltipProvider } from '@/ui/components/tooltip';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProviderCustom>
      <PwaInstall.Provider>
        <TooltipProvider>{children}</TooltipProvider>
      </PwaInstall.Provider>
    </SnackbarProviderCustom>
  );
}
