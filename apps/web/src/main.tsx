import './i18n/config';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import SnackbarProviderCustom from './providers/snackbar-provider';
import { ThemeProvider } from './providers/theme-provider';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <SnackbarProviderCustom>
        <ThemeProvider>
          {/* <JacProvider> */}
          <RouterProvider router={router} />
          {/* </JacProvider> */}
        </ThemeProvider>
      </SnackbarProviderCustom>
    </StrictMode>
  );
}
