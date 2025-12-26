import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AppProviders } from '../providers/app-provider';
import { NotFoundPage } from './not-found-page';
import type { RouterContext } from '../router/router-context';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

function RootLayout() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-blue-50 text-blue-900 transition-colors duration-300 ease-in-out dark:bg-slate-900 dark:text-slate-100">
        <main>
          <Outlet />
        </main>

        {/* <TanStackRouterDevtools /> */}
      </div>
    </AppProviders>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
