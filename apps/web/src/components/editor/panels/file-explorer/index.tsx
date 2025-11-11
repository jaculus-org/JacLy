import { useEffect, useState, useRef, type JSX, useCallback } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { enqueueSnackbar } from 'notistack';
import path from 'path';
import type { JaclyProject } from '@/lib/projects/project-manager';
import { fs } from '@zenfs/core';
import { getFileIcon } from './file-helper';
import logger from '@/lib/logger';
import { useEditor } from '@/providers/editor-provider';

const fsp = fs.promises;

export interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileSystemItem[];
}

interface FileExplorerProps {
  project: JaclyProject;
}

export function FileExplorerPanel({ project }: FileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [contextItem, setContextItem] = useState<FileSystemItem | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const initialLoadRef = useRef(true);
  const watchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addPanelSourceCode } = useEditor();

  const sortItems = useCallback((items: FileSystemItem[]): FileSystemItem[] => {
    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const waitForDirectory = async (
    dirPath: string,
    maxAttempts = 10,
    delayMs = 100
  ): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await fsp.stat(dirPath);
        return true;
      } catch {
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    return false;
  };

  const buildFileTreeForEffect = useCallback(
    async (dirPath: string): Promise<FileSystemItem[]> => {
      if (!fsp) return [];

      try {
        const items = await fsp.readdir(dirPath);
        const treeItems: FileSystemItem[] = [];

        for (const item of items) {
          const itemPath = `${dirPath}/${item}`;

          try {
            const stat = await fsp.stat(itemPath);
            const isDirectory = stat.isDirectory();

            treeItems.push({
              name: item,
              path: itemPath,
              isDirectory,
              children: isDirectory ? [] : undefined,
            });
          } catch (error) {
            console.warn(`Error checking ${itemPath}:`, error);
          }
        }

        return sortItems(treeItems);
      } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
      }
    },
    [sortItems]
  );

  const applyFolderStructure = useCallback(
    (
      items: FileSystemItem[],
      expandedSet: Set<string>
    ): Promise<FileSystemItem[]> => {
      // Use an inner recursive function so we don't reference the outer
      // `applyFolderStructure` variable while it's being defined (avoids
      // "accessed before it is declared" errors).
      const inner = async (
        currentItems: FileSystemItem[],
        set: Set<string>
      ): Promise<FileSystemItem[]> => {
        const processedItems: FileSystemItem[] = [];

        for (const item of currentItems) {
          const processedItem: FileSystemItem = {
            ...item,
          };

          if (item.isDirectory && set.has(item.path) && fsp) {
            try {
              const children = await buildFileTreeForEffect(item.path);
              processedItem.children = await inner(children, set);
            } catch (error) {
              console.error(`Error loading children for ${item.path}:`, error);
              processedItem.children = [];
            }
          } else if (item.isDirectory) {
            processedItem.children = [];
          }

          processedItems.push(processedItem);
        }

        return processedItems;
      };

      return inner(items, expandedSet);
    },
    [buildFileTreeForEffect]
  );

  const buildFileTree = useCallback(
    async (dirPath: string): Promise<FileSystemItem[]> => {
      try {
        const items = await fsp.readdir(dirPath);
        const treeItems: FileSystemItem[] = [];

        for (const item of items) {
          const itemPath = path.join(dirPath, item);

          try {
            const isDirectory = (await fsp.stat(itemPath)).isDirectory();
            treeItems.push({
              name: item,
              path: itemPath,
              isDirectory,
              children: isDirectory ? [] : undefined,
            });
          } catch (error) {
            console.warn(`Error checking ${itemPath}:`, error);
          }
        }

        return sortItems(treeItems);
      } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
      }
    },
    [sortItems]
  );

  // Load initial file tree
  useEffect(() => {
    const loadFileTree = async () => {
      setLoading(true);
      try {
        const projectRoot = `/${project.id}`;

        const isReady = await waitForDirectory(projectRoot);
        if (!isReady) {
          logger.error(`Directory ${projectRoot} not ready after retries`);
          setLoading(false);
          return;
        }

        const tree = await buildFileTreeForEffect(projectRoot);

        // Initialize expandedSet from project.folderStructure or existing expandedFolders
        let expandedSet = expandedFolders;
        if (project.folderStructure && initialLoadRef.current) {
          // Convert folderStructure Record to Set
          expandedSet = new Set<string>();
          Object.entries(project.folderStructure).forEach(
            ([path, isExpanded]) => {
              if (isExpanded) {
                expandedSet.add(path);
              }
            }
          );
        }

        const restoredTree = await applyFolderStructure(tree, expandedSet);
        setFileTree(restoredTree);
        setExpandedFolders(expandedSet);
        initialLoadRef.current = false;
      } catch (error) {
        console.error('Error loading file tree:', error);
      }
      setLoading(false);
    };

    const watchFileSystem = async () => {
      try {
        const projectRoot = `/${project.id}`;
        for await (const change of fsp.watch(projectRoot, {
          recursive: true,
        })) {
          if (change.eventType === 'change' || change.eventType === 'rename') {
            // File system has changed, refresh the tree with debounce
            if (watchTimeoutRef.current) {
              clearTimeout(watchTimeoutRef.current);
            }

            watchTimeoutRef.current = setTimeout(async () => {
              const tree = await buildFileTreeForEffect(projectRoot);
              const restoredTree = await applyFolderStructure(
                tree,
                expandedFolders
              );
              setFileTree(restoredTree);
            }, 300); // Debounce for 300ms
          }
        }
      } catch (error) {
        console.error('Error watching file system:', error);
      }
    };

    initialLoadRef.current = true;
    loadFileTree();
    watchFileSystem();

    return () => {
      if (watchTimeoutRef.current) {
        clearTimeout(watchTimeoutRef.current);
      }
    };
  }, [
    applyFolderStructure,
    buildFileTreeForEffect,
    expandedFolders,
    project.folderStructure,
    project.id,
  ]);

  const updateTreeItemExpanded = (
    items: FileSystemItem[],
    targetPath: string
  ): FileSystemItem[] => {
    return items.map(treeItem => {
      if (treeItem.path === targetPath) {
        return {
          ...treeItem,
          children:
            !expandedFolders.has(targetPath) &&
            (!treeItem.children || treeItem.children.length === 0)
              ? []
              : treeItem.children,
        };
      }
      if (treeItem.children) {
        return {
          ...treeItem,
          children: updateTreeItemExpanded(treeItem.children, targetPath),
        };
      }
      return treeItem;
    });
  };

  const addChildrenToTreeItem = (
    items: FileSystemItem[],
    targetPath: string,
    children: FileSystemItem[]
  ): FileSystemItem[] => {
    return items.map(treeItem => {
      if (treeItem.path === targetPath) {
        return { ...treeItem, children };
      }
      if (treeItem.children) {
        return {
          ...treeItem,
          children: addChildrenToTreeItem(
            treeItem.children,
            targetPath,
            children
          ),
        };
      }
      return treeItem;
    });
  };

  // Toggle directory expansion
  const toggleDirectory = async (item: FileSystemItem) => {
    if (!item.isDirectory) return;

    const newTree = updateTreeItemExpanded(fileTree, item.path);
    setFileTree(newTree);

    // Update expanded folders set
    const newExpandedFolders = new Set(expandedFolders);
    if (expandedFolders.has(item.path)) {
      newExpandedFolders.delete(item.path);
    } else {
      newExpandedFolders.add(item.path);
    }
    setExpandedFolders(newExpandedFolders);

    // Load children if expanding and not loaded yet
    if (
      !expandedFolders.has(item.path) &&
      (!item.children || item.children.length === 0)
    ) {
      const children = await buildFileTree(item.path);
      const finalTree = addChildrenToTreeItem(newTree, item.path, children);
      setFileTree(finalTree);
    }
  };

  // Handle context menu actions
  const handleRename = () => {
    if (contextItem) {
      setRenameValue(contextItem.name);
      setRenameDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!contextItem) return;

    try {
      if (contextItem.isDirectory) {
        await fsp.rmdir(contextItem.path);
      } else {
        await fsp.rm(contextItem.path);
      }

      // Refresh the parent directory
      const tree = await buildFileTree(`/${project.id}`);
      setFileTree(tree);

      enqueueSnackbar(
        `${contextItem.isDirectory ? 'Folder' : 'File'} deleted successfully`,
        { variant: 'success' }
      );
    } catch (error) {
      console.error(`Error deleting ${contextItem.path}:`, error);
    }
  };

  const handleOpen = async (item: FileSystemItem) => {
    if (item.isDirectory) {
      toggleDirectory(item);
    } else {
      addPanelSourceCode(item.path);
    }
  };

  const handleShowInTerminal = (item: FileSystemItem) => {
    const command = item.isDirectory ? `cd ${item.path}` : `cat ${item.path}`;
    console.log(`Terminal command: ${command}`);
  };

  const confirmRename = async () => {
    const renameValueTrimmed = renameValue.trim();

    if (!contextItem || !renameValueTrimmed) return;

    try {
      const newPath = path.join(
        path.dirname(contextItem.path),
        renameValueTrimmed
      );
      await fsp.rename(contextItem.path, newPath);

      // Refresh the parent directory
      const tree = await buildFileTree(`/${project.id}`);
      setFileTree(tree);

      setRenameDialogOpen(false);
      enqueueSnackbar(
        `${contextItem.isDirectory ? 'Folder' : 'File'} renamed to ${renameValueTrimmed}`,
        { variant: 'success' }
      );
    } catch (error) {
      console.error(`Error renaming ${contextItem.path}:`, error);
    }
  };

  // Render file tree recursively
  function renderFileTree(items: FileSystemItem[], depth = 0): JSX.Element[] {
    return items.map(item => (
      <div key={item.path}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-sm cursor-pointer rounded transition-colors',
                selectedItem === item.path
                  ? 'bg-slate-200 dark:bg-slate-700'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={async () => {
                setSelectedItem(item.path);
                await handleOpen(item);
              }}
            >
              {item.isDirectory && (
                <button
                  className="p-0 h-4 w-4 flex items-center justify-center"
                  onClick={e => {
                    e.stopPropagation();
                    toggleDirectory(item);
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

          <ContextMenuContent>
            <ContextMenuItem onClick={async () => await handleOpen(item)}>
              {item.isDirectory ? 'Open' : 'Open File'}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleShowInTerminal(item)}>
              Show in Terminal
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                setContextItem(item);
                handleRename();
              }}
            >
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                setContextItem(item);
                handleDelete();
              }}
              className="text-red-600"
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {item.isDirectory &&
          expandedFolders.has(item.path) &&
          item.children && (
            <div>{renderFileTree(item.children, depth + 1)}</div>
          )}
      </div>
    ));
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading files...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-1">
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No files found
          </div>
        ) : (
          <>
            <Button
              size="sm"
              className="mb-2"
              onClick={async () => {
                setLoading(true);
                const tree = await buildFileTree(`/${project.id}`);
                const restoredTree = await applyFolderStructure(
                  tree,
                  expandedFolders
                );
                setFileTree(restoredTree);
                setLoading(false);
              }}
            >
              Reload
            </Button>
            {renderFileTree(fileTree)}
          </>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {contextItem?.isDirectory ? 'Folder' : 'File'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="Enter new name"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  confirmRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
