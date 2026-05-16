import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/app-provider';
import { makeRouter } from '@/app/router';
import { makeRouterContext } from '@/app/router-context';
import '@/app/index.css';

import Hotjar from '@hotjar/browser';
import * as Sentry from '@sentry/react';

// Capture-phase click delegation: tag external links right before the
// browser handles the navigation. Avoids a body-wide MutationObserver
// scanning every <a> on every DOM change.
function installExternalLinkHandler() {
  document.addEventListener(
    'click',
    (event) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      try {
        const url = new URL(href, location.href);
        if (url.hostname && url.hostname !== location.hostname) {
          anchor.target = '_blank';
          anchor.rel = 'noopener';
        }
      } catch {
        // unparseable href (e.g. "javascript:..." or malformed) — ignore
      }
    },
    { capture: true },
  );
}

const siteId = 6691272;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);

Sentry.init({
  dsn: 'https://996565cac67dc734f86eb32e02a099fc@o4511220055670784.ingest.de.sentry.io/4511220058816592',
  sendDefaultPii: true,
  enabled: process.env.NODE_ENV === 'production',
});

async function bootstrap() {
  const context = makeRouterContext();
  const router = makeRouter(context);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );

  installExternalLinkHandler();
}

bootstrap();
