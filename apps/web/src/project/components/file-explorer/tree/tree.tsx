'use client';

import { m } from '@/core/paraglide/messages';
import { useJacFileExplorer } from '../state/context';
import { FileExplorerNodeMenu } from '../node-menu';
import { FileExplorerTreeNode } from './node';

export function FileExplorerTree() {
  const {
    state: { fileTree, selectedItem, loading, expandedFolders },
    actions: { toggleDirectory, openItem, selectItem },
  } = useJacFileExplorer();

  if (loading && fileTree.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
        {m.project_panel_fs_loading()}
      </div>
    );
  }

  if (fileTree.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        {m.project_panel_fs_empty()}
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {fileTree.map(item => (
        <FileExplorerTreeNode
          key={item.path}
          item={item}
          depth={0}
          expandedFolders={expandedFolders}
          selectedItem={selectedItem}
          onToggle={toggleDirectory}
          onOpen={openItem}
          onSelect={selectItem}
          ContextMenuComponent={FileExplorerNodeMenu}
        />
      ))}
    </div>
  );
}
