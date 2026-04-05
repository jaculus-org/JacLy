import React from 'react';
import SnackbarProviderCustom from '@/app/snackbar-provider';
import { TooltipProvider } from '@/ui/components/tooltip';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProviderCustom>
      <TooltipProvider>{children}</TooltipProvider>
    </SnackbarProviderCustom>
  );
}
