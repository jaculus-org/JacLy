import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';
import { useBuildInfo } from '@/core';
import { Home, loadHomeData } from '@/home';

export const Route = createFileRoute('/')({
  component: Root,
});

function Root() {
  const routeContext = Route.useRouteContext();
  const buildInfo = useBuildInfo();
  const dataPromise = useMemo(
    () => loadHomeData({ projectManService: routeContext.projectManService }),
    [routeContext.projectManService],
  );

  return (
    <Suspense fallback={<Home.Skeleton />}>
      <Home.Provider dataPromise={dataPromise} buildInfo={buildInfo}>
        <Home.Page />
      </Home.Provider>
    </Suspense>
  );
}
