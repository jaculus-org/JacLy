import type { RegistryListTemplate } from '@jaculus/project/registry';
import { createContext, useContext } from 'react';
import type { BuildInfo } from 'virtual-build-info';
import type { IDbProject } from '@/core/types/project';

export interface HomeReleaseSummary {
  items: string[];
}

export interface HomeState {
  jaclyTemplates: RegistryListTemplate[];
  codeTemplates: RegistryListTemplate[];
  recentProjects: IDbProject[];
  releaseSummary: HomeReleaseSummary | null;
}

export interface HomeMeta {
  buildInfo: BuildInfo;
  templatesAvailable: boolean;
  templatesLoaded: boolean;
}

export interface HomeContextValue {
  state: HomeState;
  meta: HomeMeta;
}

export const HomeContext = createContext<HomeContextValue | undefined>(undefined);

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) {
    throw new Error('Home.* components must be within Home.Provider');
  }
  return ctx;
}
