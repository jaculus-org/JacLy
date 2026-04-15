import { createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import type { RouterContext } from './router-context';

const routePrefix = import.meta.env.VITE_ROUTE_PREFIX || '';

export function makeRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    defaultPreload: 'intent',
    basepath: routePrefix ? `/${routePrefix}` : '/',
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof makeRouter>;
  }
}
