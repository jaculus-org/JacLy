import type { ReactNode } from 'react';
import { use } from 'react';
import type { BuildInfo } from 'virtual-build-info';
import { HomeContext } from './home-context';
import type { HomeDataResult } from './home-data';

interface HomeProviderProps {
  children: ReactNode;
  dataPromise: Promise<HomeDataResult>;
  buildInfo: BuildInfo;
}

export function HomeProvider({ children, dataPromise, buildInfo }: HomeProviderProps) {
  const data = use(dataPromise);

  return (
    <HomeContext.Provider
      value={{
        state: {
          jaclyTemplates: data.jaclyTemplates,
          codeTemplates: data.codeTemplates,
          recentProjects: data.recentProjects,
          releaseSummary: data.releaseSummary,
        },
        meta: {
          buildInfo,
          templatesAvailable: data.templatesAvailable,
          templatesLoaded: data.templatesLoaded,
        },
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}
