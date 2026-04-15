'use client';

import type { Dependencies } from '@jaculus/project/package';
import type { RegistryListProject } from '@jaculus/project/registry';
import { createContext, useContext } from 'react';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface JacPackagesState {
  installedLibs: Dependencies;
  availableLibChoices: RegistryListProject[];
  availableLibVersions: string[];
  selectedLib: string | null;
  selectedLibVersion: string | null;
  isInstalling: boolean;
  initialInstallDone: boolean;
  error: string | null;
  loadStatus: LoadStatus;
  loadError: string | null;
}

export interface JacPackagesActions {
  selectLib: (value: string | null) => void;
  selectLibVersion: (value: string | null) => void;
  installAll: () => void;
  addLibrary: () => void;
  removeLibrary: (name: string) => void;
  retryLoad: () => void;
}

export interface JacPackagesMeta {
  hasProject: boolean;
  packageJsonError: string | null;
}

export interface JacPackagesContextValue {
  state: JacPackagesState;
  actions: JacPackagesActions;
  meta: JacPackagesMeta;
}

export const JacPackagesContext = createContext<JacPackagesContextValue | undefined>(undefined);

export function useJacPackages() {
  const ctx = useContext(JacPackagesContext);
  if (!ctx) throw new Error('JacPackages.* components must be within JacPackages.Provider');
  return ctx;
}
