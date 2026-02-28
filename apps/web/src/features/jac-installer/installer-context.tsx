import { createContext, useContext } from 'react';
import type {
  BoardsIndex,
  BoardVariant,
  BoardVersion,
} from '@jaculus/firmware/boards';
import type { FlashProgress } from './libs/flasher';

export type InstallerSourceTab = 'online' | 'url' | 'file';

export interface InstallerState {
  baudrate: number;
  chipList: BoardsIndex[];
  selectedChip: string | null;
  selectedVariant: BoardVariant | null;
  versionList: BoardVersion[];
  selectedVersion: string | null;
  eraseFlash: boolean;
  sourceTab: InstallerSourceTab;
  firmwareUrl: string;
  firmwareFile: File | null;
  autoLoading: boolean;
  installing: boolean;
  isConnected: boolean;
  flashProgress: FlashProgress | null;
  terminalOutput: string[];
  showPopupText: string | null;
}

export interface InstallerActions {
  setBaudrate: (value: number) => void;
  setEraseFlash: (value: boolean) => void;
  setSourceTab: (tab: InstallerSourceTab) => void;
  setFirmwareUrl: (value: string) => void;
  setFirmwareFile: (file: File | null) => void;
  changeChip: (chipId: string) => void;
  changeVariant: (variantId: string) => Promise<void>;
  changeVersion: (version: string) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  flash: () => Promise<void>;
  closePopup: () => void;
}

export interface InstallerMeta {
  baudrates: string[];
}

export interface InstallerContextValue {
  state: InstallerState;
  actions: InstallerActions;
  meta: InstallerMeta;
}

export const InstallerContext = createContext<
  InstallerContextValue | undefined
>(undefined);

export function useInstaller() {
  const ctx = useContext(InstallerContext);
  if (!ctx)
    throw new Error('Installer.* components must be within Installer.Provider');
  return ctx;
}
