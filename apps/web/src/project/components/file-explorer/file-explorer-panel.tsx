'use client';

import { ContextMenu, ContextMenuTrigger } from '@/ui/components/context-menu';
import { useJacFileExplorer } from './file-explorer-context';
import { JacFileExplorerNodeMenu } from './file-explorer-node-menu';
import { JacFileExplorerTree } from './file-explorer-tree';

export function JacFileExplorerPanel() {
  const {
    meta: { rootItem },
  } = useJacFileExplorer();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex-1 overflow-auto p-1 min-h-full">
          <JacFileExplorerTree />
        </div>
      </ContextMenuTrigger>
      <JacFileExplorerNodeMenu item={rootItem} />
    </ContextMenu>
  );
}
