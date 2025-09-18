import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { ThemeProvider } from './providers/theme-provider';
import { JacProvider } from './jaculus/provider/jac-context';
import SnackbarProviderCustom from './providers/snackbar-provider';
import { IntlayerProvider } from 'react-intlayer';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <IntlayerProvider>
        <SnackbarProviderCustom>
          <ThemeProvider>
            <JacProvider>
              <RouterProvider router={router} />
            </JacProvider>
          </ThemeProvider>
        </SnackbarProviderCustom>
      </IntlayerProvider>
    </StrictMode>
  );
}
