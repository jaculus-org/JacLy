'use client';

import { m } from '@/paraglide/messages';
import { useJacFileExplorer } from '../jac-file-explorer-context';
import { JacFileExplorerNodeMenu } from './jac-file-explorer-node-menu';
import { JacFileExplorerTreeNode } from './jac-file-explorer-tree-node';

export function JacFileExplorerTree() {
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
        <JacFileExplorerTreeNode
          key={item.path}
          item={item}
          depth={0}
          expandedFolders={expandedFolders}
          selectedItem={selectedItem}
          onToggle={toggleDirectory}
          onOpen={openItem}
          onSelect={selectItem}
          ContextMenuComponent={JacFileExplorerNodeMenu}
        />
      ))}
    </div>
  );
}
