import { createRootRouteWithContext } from '@tanstack/react-router';
import { NotFoundPage } from '@/routes/not-found';
import type { RouterContext } from '@/router/router-context';
import { RootLayout } from '@/app/root-layout';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
