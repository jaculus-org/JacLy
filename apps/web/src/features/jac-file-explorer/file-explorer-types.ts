'use client';

import type { ComponentType } from 'react';

export interface FileSystemItem {
  isRoot: boolean;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileSystemItem[];
}

export interface FileTreeNodeProps {
  item: FileSystemItem;
  depth: number;
  expandedFolders: Set<string>;
  selectedItem: string | null;
  onToggle: (item: FileSystemItem) => void;
  onOpen: (item: FileSystemItem) => void;
  onSelect: (path: string) => void;
  ContextMenuComponent: ComponentType<{ item: FileSystemItem }>;
}
