import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Route404 } from './404';
import { Header, Links } from '../components/header/Header';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

function RootLayout() {
  const links: Links = {
    Home: '/',
    Blocks: '/blocks',
  };

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 transition-colors duration-300 ease-in-out dark:bg-slate-900 dark:text-slate-100">
      <Header links={links} />

      <main>
        <Outlet />
      </main>

      {/* <TanStackRouterDevtools /> */}
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: Route404,
});
