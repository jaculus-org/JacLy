'use client';

import { m } from '@/paraglide/messages';
import {
  ContextMenuContent,
  ContextMenuItem,
} from '@/features/shared/components/ui/context-menu';
import {
  CopyIcon,
  FilePlusIcon,
  FolderMinusIcon,
  FolderPenIcon,
  FolderPlusIcon,
} from 'lucide-react';
import { useJacFileExplorer } from '../jac-file-explorer-context';
import type { FileSystemItem } from '../file-explorer-types';

export function JacFileExplorerNodeMenu({ item }: { item: FileSystemItem }) {
  const {
    actions: {
      createNewFile,
      createNewDirectory,
      renameItem,
      removeItem,
      copyPath,
    },
  } = useJacFileExplorer();

  return (
    <ContextMenuContent>
      {item.isDirectory && (
        <>
          <ContextMenuItem onClick={() => createNewFile(item)}>
            <FilePlusIcon size={16} className="mr-2" />{' '}
            {m.project_panel_fs_new_file()}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => createNewDirectory(item)}>
            <FolderPlusIcon size={16} className="mr-2" />{' '}
            {m.project_panel_fs_new_folder()}
          </ContextMenuItem>
        </>
      )}
      {!item.isRoot && (
        <>
          <ContextMenuItem onClick={() => renameItem(item)}>
            <FolderPenIcon size={16} className="mr-2" />{' '}
            {m.project_panel_fs_rename()}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => removeItem(item)}
            className="text-red-500"
          >
            <FolderMinusIcon size={16} className="mr-2" />{' '}
            {m.project_panel_fs_delete()}
          </ContextMenuItem>
        </>
      )}
      <ContextMenuItem onClick={() => copyPath(item)}>
        <CopyIcon size={16} className="mr-2" /> {m.project_panel_fs_copy_path()}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
