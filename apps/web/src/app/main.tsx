import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/app-provider';
import { makeRouter } from '@/app/router';
import { makeRouterContext } from '@/app/router-context';
import '@/app/index.css';

import Hotjar from '@hotjar/browser';
import * as Sentry from '@sentry/react';

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
}

bootstrap();
