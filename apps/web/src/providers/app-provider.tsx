import React from 'react';
import SnackbarProviderCustom from '@/providers/snackbar-provider';
import { TooltipProvider } from '@/features/shared/components/ui/tooltip';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProviderCustom>
      <TooltipProvider>{children}</TooltipProvider>
    </SnackbarProviderCustom>
  );
}
