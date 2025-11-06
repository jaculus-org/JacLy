import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import SnackbarProviderCustom from './providers/snackbar-provider';
import { ThemeProvider } from './providers/theme-provider';
import { HeaderProvider } from './providers/header-provider';
import { routeTree } from './routeTree.gen';
import './index.css';

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
          <HeaderProvider>
            <RouterProvider router={router} />
          </HeaderProvider>
        </ThemeProvider>
      </SnackbarProviderCustom>
    </StrictMode>
  );
}
