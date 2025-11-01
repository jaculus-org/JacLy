import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import SnackbarProviderCustom from './providers/snackbar-provider';
import { ThemeProvider } from './providers/theme-provider';
import { routeTree } from './routeTree.gen';
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime.js';

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,

  rewrite: {
    input: ({ url }) => deLocalizeUrl(url),
    output: ({ url }) => localizeUrl(url),
  },
});

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
