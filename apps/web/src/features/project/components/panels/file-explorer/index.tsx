import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/features/shared/components/ui/context-menu';
import {
  CopyIcon,
  FilePlusIcon,
  FolderMinusIcon,
  FolderPenIcon,
  FolderPlusIcon,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { FileSystemItem } from './types';
import { buildFileTree, loadDirectoryChildren } from './helper';
import { useEditor } from '@/features/project/provider/project-editor-provider';
import { enqueueSnackbar } from 'notistack';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { debounce } from '@/lib/utils/debouncer';
import { FileTreeNode } from './file-tree-node';

export function FileExplorerPanel() {
  const { fsp, projectPath } = useActiveProject();
  const { openPanel } = useEditor();

  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // We keep expandedFolders in state for UI updates, and a Ref for the background watcher
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const expandedFoldersRef = useRef(expandedFolders);

  const rootFileItem: FileSystemItem = {
    isRoot: true,
    name: projectPath,
    path: projectPath,
    isDirectory: true,
    children: [],
  };

  // Sync Ref with State automatically
  useEffect(() => {
    expandedFoldersRef.current = expandedFolders;
  }, [expandedFolders]);

  // Update tree helper to ensure React sees data changes
  const updateTreeItem = useCallback(
    (
      nodes: FileSystemItem[],
      targetPath: string,
      updater: (node: FileSystemItem) => FileSystemItem
    ): FileSystemItem[] => {
      return nodes.map(node => {
        if (node.path === targetPath) {
          return updater(node);
        }
        if (node.children) {
          const newChildren = updateTreeItem(
            node.children,
            targetPath,
            updater
          );
          if (newChildren !== node.children) {
            return { ...node, children: newChildren };
          }
        }
        return node;
      });
    },
    []
  );

  const loadTreeWithExpansion = useCallback(
    async (
      path: string,
      expandedSet: Set<string>
    ): Promise<FileSystemItem[]> => {
      try {
        const items = await buildFileTree(fsp, path);
        // Recursively load children for expanded folders
        await Promise.all(
          items.map(async item => {
            if (item.isDirectory && expandedSet.has(item.path)) {
              item.children = await loadTreeWithExpansion(
                item.path,
                expandedSet
              );
            }
          })
        );
        return items;
      } catch (error) {
        console.error(`Error loading tree at ${path}:`, error);
        return [];
      }
    },
    [fsp]
  );

  const refreshTree = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const tree = await loadTreeWithExpansion(
          projectPath,
          expandedFoldersRef.current
        );
        setFileTree(tree);
      } catch (error) {
        console.error('Failed to load file tree:', error);
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [projectPath, loadTreeWithExpansion]
  );

  // Initial Load
  useEffect(() => {
    refreshTree(false);
  }, [refreshTree]);

  useEffect(() => {
    if (!projectPath || !fsp.watch) return;

    let aborted = false;
    const abortController = new AbortController();

    const debouncedRefresh = debounce(() => {
      if (!aborted) {
        refreshTree(true);
      }
    }, 300);

    (async () => {
      try {
        const watcher = fsp.watch(projectPath, {
          recursive: true,
          signal: abortController.signal,
        });
        for await (const event of watcher) {
          void event;
          if (aborted) break;
          debouncedRefresh();
        }
      } catch (error) {
        if (!aborted) console.error('Error watching files:', error);
      }
    })();

    return () => {
      aborted = true;
      abortController.abort();
    };
  }, [projectPath, fsp, refreshTree]);

  const handleOpen = useCallback(
    async (item: FileSystemItem) => {
      if (!item.isDirectory) {
        const path = item.path.replace(`${projectPath}/`, '');
        openPanel('code', { filePath: path });
      }
    },
    [projectPath, openPanel]
  );

  const toggleDirectory = useCallback(
    async (item: FileSystemItem) => {
      setExpandedFolders(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(item.path)) {
          newExpanded.delete(item.path);
        } else {
          newExpanded.add(item.path);
        }
        return newExpanded;
      });

      // If we are opening and children are missing, load them
      if (
        !expandedFoldersRef.current.has(item.path) &&
        (!item.children || item.children.length === 0)
      ) {
        const children = await loadDirectoryChildren(fsp, item);

        setFileTree(prevTree =>
          updateTreeItem(prevTree, item.path, node => ({
            ...node,
            children: children,
          }))
        );
      }
    },
    [fsp, updateTreeItem]
  );

  const createNewFile = async (item: FileSystemItem) => {
    const fileName = prompt(
      `Creating new file under: ${item.path}\nEnter file name:`
    );
    if (!fileName) return;
    try {
      await fsp.writeFile(`${item.path}/${fileName}`, '', 'utf-8');
      openPanel('code', {
        filePath: `${item.path}/${fileName}`.replace(`${projectPath}/`, ''),
      });
    } catch {
      enqueueSnackbar('Failed to create file', { variant: 'error' });
    }
  };

  const createNewDirectory = async (item: FileSystemItem) => {
    const dirName = prompt(
      `Creating new folder under: ${item.path}\nEnter folder name:`
    );
    if (!dirName) return;
    try {
      await fsp.mkdir(`${item.path}/${dirName}`);
    } catch {
      enqueueSnackbar('Failed to create folder', { variant: 'error' });
    }
  };

  const renameItem = async (item: FileSystemItem) => {
    const newName = prompt(`Enter new name for "${item.name}":`, item.name);
    if (!newName || newName === item.name) return;
    try {
      const newPath = item.path.replace(/[^/]+$/, newName);
      await fsp.rename(item.path, newPath);
    } catch {
      enqueueSnackbar('Failed to rename', { variant: 'error' });
    }
  };

  const removeItem = async (item: FileSystemItem) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      if (item.isDirectory)
        await fsp.rm(item.path, { recursive: true, force: true });
      else await fsp.unlink(item.path);
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  const NodeContextMenu = useCallback(
    ({ item }: { item: FileSystemItem }) => (
      <ContextMenuContent>
        {item.isDirectory && (
          <>
            <ContextMenuItem onClick={() => createNewFile(item)}>
              <FilePlusIcon size={16} className="mr-2" /> New File
            </ContextMenuItem>
            <ContextMenuItem onClick={() => createNewDirectory(item)}>
              <FolderPlusIcon size={16} className="mr-2" /> New Folder
            </ContextMenuItem>
          </>
        )}
        {!item.isRoot && (
          <>
            <ContextMenuItem onClick={() => renameItem(item)}>
              <FolderPenIcon size={16} className="mr-2" /> Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => removeItem(item)}
              className="text-red-500"
            >
              <FolderMinusIcon size={16} className="mr-2" /> Delete
            </ContextMenuItem>
          </>
        )}
        <ContextMenuItem
          onClick={() => navigator.clipboard.writeText(item.path)}
        >
          <CopyIcon size={16} className="mr-2" /> Copy Path
        </ContextMenuItem>
      </ContextMenuContent>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectPath]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex-1 overflow-auto p-1 min-h-full">
          {loading && fileTree.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              Loading files...
            </div>
          ) : fileTree.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No files found
            </div>
          ) : (
            <div className="min-h-full">
              {fileTree.map(item => (
                <FileTreeNode
                  key={item.path}
                  item={item}
                  depth={0}
                  expandedFolders={expandedFolders}
                  selectedItem={selectedItem}
                  onToggle={toggleDirectory}
                  onOpen={handleOpen}
                  onSelect={setSelectedItem}
                  ContextMenuComponent={NodeContextMenu}
                />
              ))}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <NodeContextMenu item={rootFileItem} />
    </ContextMenu>
  );
}
