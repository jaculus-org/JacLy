import { AppRouterProviders } from '@/providers/app-router-provider';
import { Outlet } from '@tanstack/react-router';

export function RootLayout() {
  return (
    <AppRouterProviders>
      <div className="min-h-screen bg-blue-50 text-blue-900 transition-colors duration-300 ease-in-out dark:bg-slate-900 dark:text-slate-100">
        <main>
          <Outlet />
        </main>

        {/* <TanStackRouterDevtools /> */}
      </div>
    </AppRouterProviders>
  );
}
