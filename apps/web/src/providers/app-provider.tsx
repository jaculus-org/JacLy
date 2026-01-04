import React from 'react';
import SnackbarProviderCustom from '@/providers/snackbar-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SnackbarProviderCustom>{children}</SnackbarProviderCustom>;
}
