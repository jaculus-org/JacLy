'use client';

import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/features/shared/components/ui/context-menu';
import { useJacFileExplorer } from '../jac-file-explorer-context';
import { JacFileExplorerNodeMenu } from './jac-file-explorer-node-menu';
import { JacFileExplorerTree } from './jac-file-explorer-tree';

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
