import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { makeRouterContext } from './router/router-context';
import { makeRouter } from './router/router';
import './index.css';

async function bootstrap() {
  const context = makeRouterContext();
  const router = makeRouter(context);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}

bootstrap();
