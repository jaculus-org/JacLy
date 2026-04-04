'use client';

import { createContext, useContext } from 'react';
import type { FileSystemItem } from './file-explorer-types';

export interface JacFileExplorerState {
  fileTree: FileSystemItem[];
  selectedItem: string | null;
  loading: boolean;
  expandedFolders: Set<string>;
}

export interface JacFileExplorerActions {
  refreshTree: (isBackground?: boolean) => Promise<void>;
  openItem: (item: FileSystemItem) => void;
  toggleDirectory: (item: FileSystemItem) => Promise<void>;
  selectItem: (path: string) => void;
  createNewFile: (item: FileSystemItem) => Promise<void>;
  createNewDirectory: (item: FileSystemItem) => Promise<void>;
  renameItem: (item: FileSystemItem) => Promise<void>;
  removeItem: (item: FileSystemItem) => Promise<void>;
  copyPath: (item: FileSystemItem) => void;
}

export interface JacFileExplorerMeta {
  rootItem: FileSystemItem;
  hasProject: boolean;
}

export interface JacFileExplorerContextValue {
  state: JacFileExplorerState;
  actions: JacFileExplorerActions;
  meta: JacFileExplorerMeta;
}

export const JacFileExplorerContext = createContext<
  JacFileExplorerContextValue | undefined
>(undefined);

export function useJacFileExplorer() {
  const ctx = useContext(JacFileExplorerContext);
  if (!ctx)
    throw new Error(
      'JacFileExplorer.* components must be within JacFileExplorer.Provider'
    );
  return ctx;
}
