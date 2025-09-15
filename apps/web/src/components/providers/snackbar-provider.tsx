import { closeSnackbar, SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function SnackbarProviderCustom({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SnackbarProvider
      maxSnack={3}
      preventDuplicate
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      action={snackbarId => <X onClick={() => closeSnackbar(snackbarId)} />}
    >
      {children}
    </SnackbarProvider>
  );
}
