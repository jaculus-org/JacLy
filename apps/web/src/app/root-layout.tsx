import { Outlet, useMatches } from '@tanstack/react-router';
import { AppRouterProviders } from '@/app/app-router-provider';
import { GeneralHeader } from '@/ui/components/custom/general-header';

export function RootLayout() {
  const matches = useMatches();
  // Don't show GeneralHeader on /editor/:projectId routes
  const isEditorProjectPage = matches.some((match) => match.routeId === '/project/$projectId');

  return (
    <AppRouterProviders>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 ease-in-out">
        {!isEditorProjectPage && <GeneralHeader />}
        <main
          className={
            isEditorProjectPage ? 'w-full' : 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
          }
        >
          <Outlet />
        </main>

        {/* <TanStackRouterDevtools /> */}
      </div>
    </AppRouterProviders>
  );
}
