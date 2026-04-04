import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { makeRouterContext } from '@/app/router-context';
import { makeRouter } from '@/app/router';
import { AppProviders } from '@/app/app-provider';
import '@/app/index.css';

async function bootstrap() {
  const context = makeRouterContext();
  const router = makeRouter(context);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>
  );
}

bootstrap();
