'use client';

import { createContext, useContext } from 'react';
import type { Dependencies } from '@jaculus/project/package';

export interface JacPackagesState {
  installedLibs: Dependencies;
  availableLibChoices: string[];
  availableLibVersions: string[];
  selectedLib: string | null;
  selectedLibVersion: string | null;
  isInstalling: boolean;
  error: string | null;
}

export interface JacPackagesActions {
  selectLib: (value: string | null) => void;
  selectLibVersion: (value: string | null) => void;
  installAll: () => void;
  addLibrary: () => void;
  removeLibrary: (name: string) => void;
}

export interface JacPackagesMeta {
  hasProject: boolean;
}

export interface JacPackagesContextValue {
  state: JacPackagesState;
  actions: JacPackagesActions;
  meta: JacPackagesMeta;
}

export const JacPackagesContext = createContext<
  JacPackagesContextValue | undefined
>(undefined);

export function useJacPackages() {
  const ctx = useContext(JacPackagesContext);
  if (!ctx)
    throw new Error(
      'JacPackages.* components must be within JacPackages.Provider'
    );
  return ctx;
}
