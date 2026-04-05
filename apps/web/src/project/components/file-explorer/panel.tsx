'use client';

import { ContextMenu, ContextMenuTrigger } from '@/ui/components/context-menu';
import { useJacFileExplorer } from './state/context';
import { FileExplorerNodeMenu } from './node-menu';
import { FileExplorerTree } from './tree/tree';

export function FileExplorerPanel() {
  const {
    meta: { rootItem },
  } = useJacFileExplorer();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex-1 overflow-auto p-1 min-h-full">
          <FileExplorerTree />
        </div>
      </ContextMenuTrigger>
      <FileExplorerNodeMenu item={rootItem} />
    </ContextMenu>
  );
}
