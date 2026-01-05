import { AppRouterProviders } from '@/providers/app-router-provider';
import { GeneralHeader } from '@/features/shared/components/custom/general-header';
import { Outlet, useMatches } from '@tanstack/react-router';

export function RootLayout() {
  const matches = useMatches();
  // Don't show GeneralHeader on /editor/:projectId routes
  const isEditorProjectPage = matches.some(
    match => match.routeId === '/editor/$projectId'
  );

  return (
    <AppRouterProviders>
      <div className="min-h-screen bg-blue-50 text-blue-900 transition-colors duration-300 ease-in-out dark:bg-slate-900 dark:text-slate-100">
        {!isEditorProjectPage && <GeneralHeader />}
        <main
          className={
            isEditorProjectPage
              ? 'w-full'
              : 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
          }
        >
          <Outlet />
        </main>

        {/* <TanStackRouterDevtools /> */}
      </div>
    </AppRouterProviders>
  );
}
