'use client';

import { createContext, useContext } from 'react';
import type { FileSystemItem } from '../types';

export interface FileExplorerState {
  fileTree: FileSystemItem[];
  selectedItem: string | null;
  loading: boolean;
  expandedFolders: Set<string>;
}

export interface FileExplorerActions {
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

export interface FileExplorerMeta {
  rootItem: FileSystemItem;
  hasProject: boolean;
}

export interface FileExplorerContextValue {
  state: FileExplorerState;
  actions: FileExplorerActions;
  meta: FileExplorerMeta;
}

export const FileExplorerContext = createContext<FileExplorerContextValue | undefined>(undefined);

export function useJacFileExplorer() {
  const ctx = useContext(FileExplorerContext);
  if (!ctx) throw new Error('FileExplorer components must be within FileExplorerProvider');
  return ctx;
}
