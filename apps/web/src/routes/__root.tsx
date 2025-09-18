import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header, Links } from '@/components/layout/header';
import { Page404 } from '@/components/page/404';
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
  notFoundComponent: Page404,
});
