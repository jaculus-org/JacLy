import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/features/shared/components/ui/context-menu';
import { useActiveProject } from '@/hooks/use-active-project';
import { cn } from '@/lib/utils/cn';
import {
  ChevronDown,
  ChevronRight,
  FilePlusIcon,
  FileTypeIcon,
  FileXIcon,
  Folder,
  FolderMinusIcon,
  FolderOpen,
  FolderPenIcon,
  FolderPlusIcon,
} from 'lucide-react';
import { useState, useEffect, type JSX, useEffectEvent } from 'react';
import type { FileSystemItem } from './types';
import { getFileIcon, buildFileTree, loadDirectoryChildren } from './helper';
import { useEditor } from '@/features/project/provider/project-editor-provider';
import { enqueueSnackbar } from 'notistack';

export function FileExplorerPanel() {
  const { fsp, projectPath } = useActiveProject();
  const { openPanel } = useEditor();

  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  const rootFileItem: FileSystemItem = {
    isRoot: true,
    name: projectPath,
    path: projectPath,
    isDirectory: true,
    children: [],
  };

  const loadFileTree = useEffectEvent(async () => {
    setLoading(true);
    try {
      const tree = await buildFileTree(fsp, projectPath);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadFileTree();
  }, [projectPath]);

  useEffect(() => {
    if (!projectPath || !fsp.watch) return;

    let aborted = false;
    const abortController = new AbortController();

    (async () => {
      try {
        const watcher = fsp.watch(projectPath, {
          recursive: true,
          signal: abortController.signal,
        });

        for await (const event of watcher) {
          if (aborted) break;
          console.log('File system change detected:', event);
          loadFileTree();
        }
      } catch (error) {
        if (!aborted) {
          console.error('Error watching files:', error);
        }
      }
    })();

    return () => {
      aborted = true;
      abortController.abort();
    };
  }, [projectPath, fsp]);

  async function handleOpen(item: FileSystemItem) {
    if (item.isDirectory) {
      await toggleDirectory(item);
    } else {
      const path = item.path.replace(`${projectPath}/`, '');
      openPanel('code', { filePath: path });
    }
  }

  async function toggleDirectory(item: FileSystemItem) {
    const newExpanded = new Set(expandedFolders);

    if (newExpanded.has(item.path)) {
      newExpanded.delete(item.path);
    } else {
      newExpanded.add(item.path);

      // Load children if not already loaded
      if (!item.children || item.children.length === 0) {
        const children = await loadDirectoryChildren(fsp, item);
        updateItemChildren(fileTree, item.path, children);
      }
    }

    setExpandedFolders(newExpanded);
  }

  async function createNewFile(item: FileSystemItem) {
    const fileName = prompt(
      `Creating new file under: ${item.path}\nEnter file name:`
    );
    if (!fileName) return;

    const newPath = `${item.path}/${fileName}`;
    try {
      await fsp.writeFile(newPath, '', 'utf-8');
    } catch (error) {
      console.error('Error creating file:', error);
      enqueueSnackbar('Failed to create file', { variant: 'error' });
    }
  }

  async function createNewDirectory(item: FileSystemItem) {
    const dirName = prompt(
      `Creating new folder under: ${item.path}\nEnter folder name:`
    );
    if (!dirName) return;

    const newPath = `${item.path}/${dirName}`;
    try {
      await fsp.mkdir(newPath);
    } catch (error) {
      console.error('Error creating directory:', error);
      enqueueSnackbar('Failed to create directory', { variant: 'error' });
    }
  }

  async function removeItem(item: FileSystemItem) {
    confirm(
      `Are you sure you want to delete "${item.isDirectory ? 'folder' : 'file'} ${item.name}"?`
    );
    try {
      if (item.isDirectory) {
        await fsp.rm(item.path, { recursive: true, force: true });
      } else {
        await fsp.unlink(item.path);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  }

  async function renameItem(item: FileSystemItem) {
    const newName = prompt(`Enter new name for "${item.name}":`, item.name);
    if (!newName || newName === item.name) return;

    const newPath = item.path.replace(/[^/]+$/, newName);
    try {
      await fsp.rename(item.path, newPath);
    } catch (error) {
      console.error('Error renaming item:', error);
      enqueueSnackbar('Failed to rename item', { variant: 'error' });
    }
  }

  function updateItemChildren(
    items: FileSystemItem[],
    path: string,
    children: FileSystemItem[]
  ) {
    for (const item of items) {
      if (item.path === path) {
        item.children = children;
        setFileTree([...fileTree]); // Force re-render
        return;
      }
      if (item.children) {
        updateItemChildren(item.children, path, children);
      }
    }
  }

  function contextMenu(item: FileSystemItem): JSX.Element {
    return (
      <ContextMenuContent>
        {item.isDirectory && (
          <ContextMenuItem onClick={async () => await createNewFile(item)}>
            <FilePlusIcon size={16} className="mr-2 inline-block" />
            New File
          </ContextMenuItem>
        )}
        {item.isDirectory && (
          <ContextMenuItem onClick={async () => await createNewDirectory(item)}>
            <FolderPlusIcon size={16} className="mr-2 inline-block" />
            New Folder
          </ContextMenuItem>
        )}

        {!item.isRoot && (
          <ContextMenuItem onClick={async () => await renameItem(item)}>
            {item.isDirectory ? (
              <FolderPenIcon size={16} className="mr-2 inline-block" />
            ) : (
              <FileTypeIcon size={16} className="mr-2 inline-block" />
            )}
            Rename {item.isDirectory ? 'Folder' : 'File'}
          </ContextMenuItem>
        )}

        {!item.isRoot && (
          <ContextMenuItem
            onClick={async () => {
              await removeItem(item);
            }}
          >
            {item.isDirectory ? (
              <FolderMinusIcon size={16} className="mr-2 inline-block" />
            ) : (
              <FileXIcon size={16} className="mr-2 inline-block" />
            )}
            Delete {item.isDirectory ? 'Folder' : 'File'}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    );
  }

  // Render file tree recursively
  function renderFileTree(items: FileSystemItem[], depth = 0): JSX.Element[] {
    return items.map(item => (
      <div key={item.path}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 text-sm cursor-pointer rounded transition-colors',
                selectedItem === item.path
                  ? 'bg-slate-200 dark:bg-slate-700'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              style={{ paddingLeft: `${depth * 21 + 8}px` }}
              onClick={() => {
                setSelectedItem(item.path);
                handleOpen(item);
              }}
              onDoubleClick={async () => await handleOpen(item)}
            >
              {item.isDirectory && (
                <button
                  className="p-0 h-4 w-4 flex items-center justify-center"
                  onClick={async e => {
                    e.stopPropagation();
                    await toggleDirectory(item);
                  }}
                >
                  {expandedFolders.has(item.path) ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
              )}

              {item.isDirectory ? (
                expandedFolders.has(item.path) ? (
                  <FolderOpen size={16} className="text-blue-500" />
                ) : (
                  <Folder size={16} className="text-blue-500" />
                )
              ) : (
                getFileIcon(item.name, false)
              )}

              <span className="truncate flex-1">{item.name}</span>
            </div>
          </ContextMenuTrigger>

          {contextMenu(item)}
        </ContextMenu>

        {item.isDirectory &&
          expandedFolders.has(item.path) &&
          item.children && (
            <div>{renderFileTree(item.children, depth + 1)}</div>
          )}
      </div>
    ));
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex-1 overflow-auto p-1 min-h-full">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading files...
            </div>
          ) : fileTree.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No files found
            </div>
          ) : (
            <div className="min-h-full">{renderFileTree(fileTree)}</div>
          )}
        </div>
      </ContextMenuTrigger>
      {contextMenu(rootFileItem)}
    </ContextMenu>
  );
}
