import { createContext, useContext } from 'react';

export interface PwaInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
}

export interface PwaInstallActions {
  promptInstall: () => Promise<boolean>;
}

export interface PwaInstallMeta {
  isSupported: boolean;
}

export interface PwaInstallContextValue {
  state: PwaInstallState;
  actions: PwaInstallActions;
  meta: PwaInstallMeta;
}

export const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error('PwaInstall.* components must be within PwaInstall.Provider');
  }

  return context;
}
