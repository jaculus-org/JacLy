import { useJac } from '@/jaculus/provider/jac-context';
import { updateProjectFolderStructure } from '@/lib/project/jacProject';
import { useEffect, useState, useCallback, useRef, type JSX } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
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

interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileSystemItem[];
  expanded?: boolean;
}

interface FileExplorerProps {
  onFileSelect?: (filePath: string) => void;
}

export function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const { activeProject, fsp } = useJac();
  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [contextItem, setContextItem] = useState<FileSystemItem | null>(null);
  const initialLoadRef = useRef(true);

  // Get file icon based on extension
  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return null; // Will be handled separately

    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconProps = { size: 16, className: 'text-blue-400' };

    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <FileCode {...iconProps} className="text-yellow-400" />;
      case 'txt':
      case 'md':
      case 'json':
      case 'xml':
      case 'html':
      case 'css':
        return <FileText {...iconProps} className="text-green-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage {...iconProps} className="text-purple-400" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo {...iconProps} className="text-red-400" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio {...iconProps} className="text-pink-400" />;
      default:
        return <File {...iconProps} />;
    }
  };

  // Recursively build file tree
  const buildFileTree = useCallback(
    async (dirPath: string): Promise<FileSystemItem[]> => {
      if (!fsp) return [];

      try {
        const items = await fsp.readdir(dirPath);
        const treeItems: FileSystemItem[] = [];

        for (const item of items) {
          const itemPath = `${dirPath}/${item}`;

          try {
            const isDirectory = (await fsp.stat(itemPath)).isDirectory();

            treeItems.push({
              name: item,
              path: itemPath,
              isDirectory,
              expanded: false,
              children: isDirectory ? [] : undefined,
            });
          } catch (error) {
            console.warn(`Error checking ${itemPath}:`, error);
          }
        }

        // Sort: directories first, then files
        return treeItems.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
      }
    },
    [fsp]
  );

  // Load initial file tree
  useEffect(
    () => {
      if (!activeProject || !fsp) {
        setFileTree([]);
        setLoading(false);
        return;
      }

      // Build file tree function (moved inside effect)
      const buildFileTreeForEffect = async (
        dirPath: string
      ): Promise<FileSystemItem[]> => {
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
                expanded: false,
                children: isDirectory ? [] : undefined,
              });
            } catch (error) {
              console.warn(`Error checking ${itemPath}:`, error);
            }
          }

          // Sort: directories first, then files
          return treeItems.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });
        } catch (error) {
          console.error(`Error reading directory ${dirPath}:`, error);
          return [];
        }
      };

      // Apply saved folder structure to restore expanded states (moved inside effect)
      const applyFolderStructure = async (
        items: FileSystemItem[],
        savedStructure: Record<string, boolean>
      ): Promise<FileSystemItem[]> => {
        const processedItems: FileSystemItem[] = [];

        for (const item of items) {
          const isExpanded = savedStructure[item.path] === true; // Explicit check for true
          const processedItem: FileSystemItem = {
            ...item,
            expanded: isExpanded,
          };

          // If this directory should be expanded, load its children
          if (item.isDirectory && isExpanded && fsp) {
            try {
              const children = await buildFileTreeForEffect(item.path);
              processedItem.children = await applyFolderStructure(
                children,
                savedStructure
              );
            } catch (error) {
              console.error(`Error loading children for ${item.path}:`, error);
              processedItem.children = [];
              // Keep the item expanded even if children failed to load
            }
          } else if (item.isDirectory) {
            // For non-expanded directories, ensure children is empty array
            processedItem.children = [];
          }

          processedItems.push(processedItem);
        }

        return processedItems;
      };

      const loadFileTree = async () => {
        setLoading(true);
        try {
          const projectRoot = `/${activeProject.id}`;
          const tree = await buildFileTreeForEffect(projectRoot);

          // Apply saved folder structure if available and this is initial load
          if (activeProject.folderStructure && initialLoadRef.current) {
            const restoredTree = await applyFolderStructure(
              tree,
              activeProject.folderStructure
            );
            setFileTree(restoredTree);
            initialLoadRef.current = false;
          } else {
            setFileTree(tree);
            if (initialLoadRef.current) {
              initialLoadRef.current = false;
            }
          }
        } catch (error) {
          console.error('Error loading file tree:', error);
        }
        setLoading(false);
      }; // Reset initial load flag when project changes
      initialLoadRef.current = true;
      loadFileTree();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProject?.id, fsp]
  );

  // Toggle directory expansion
  const toggleDirectory = async (item: FileSystemItem) => {
    if (!item.isDirectory) return;

    const updateTree = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(treeItem => {
        if (treeItem.path === item.path) {
          const expanded = !treeItem.expanded;
          return {
            ...treeItem,
            expanded,
            children:
              expanded && (!treeItem.children || treeItem.children.length === 0)
                ? [] // Will be loaded below
                : treeItem.children,
          };
        }
        if (treeItem.children) {
          return {
            ...treeItem,
            children: updateTree(treeItem.children),
          };
        }
        return treeItem;
      });
    };

    const newTree = updateTree(fileTree);
    setFileTree(newTree);

    // Save expanded state to project
    if (activeProject) {
      const folderStructure: Record<string, boolean> = {};
      const collectExpandedStates = (items: FileSystemItem[]) => {
        items.forEach(treeItem => {
          if (treeItem.isDirectory) {
            // Explicitly save true for expanded, false for collapsed
            folderStructure[treeItem.path] = treeItem.expanded === true;
            if (treeItem.children) {
              collectExpandedStates(treeItem.children);
            }
          }
        });
      };
      collectExpandedStates(newTree);
      updateProjectFolderStructure(activeProject.id, folderStructure);
      // Removed refreshActiveProject() to prevent re-renders
    }

    // Load children if expanding and not loaded yet
    if (!item.expanded && (!item.children || item.children.length === 0)) {
      const children = await buildFileTree(item.path);

      const updateTreeWithChildren = (
        items: FileSystemItem[]
      ): FileSystemItem[] => {
        return items.map(treeItem => {
          if (treeItem.path === item.path) {
            return {
              ...treeItem,
              children,
            };
          }
          if (treeItem.children) {
            return {
              ...treeItem,
              children: updateTreeWithChildren(treeItem.children),
            };
          }
          return treeItem;
        });
      };

      const finalTree = updateTreeWithChildren(newTree);
      setFileTree(finalTree);

      // Update folder structure again after loading children
      if (activeProject) {
        const folderStructure: Record<string, boolean> = {};
        const collectExpandedStates = (items: FileSystemItem[]) => {
          items.forEach(treeItem => {
            if (treeItem.isDirectory) {
              // Explicitly save true for expanded, false for collapsed
              folderStructure[treeItem.path] = treeItem.expanded === true;
              if (treeItem.children) {
                collectExpandedStates(treeItem.children);
              }
            }
          });
        };
        collectExpandedStates(finalTree);
        updateProjectFolderStructure(activeProject.id, folderStructure);
        // Removed refreshActiveProject() to prevent re-renders
      }
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
    if (!contextItem || !fsp || !activeProject) return;

    try {
      if (contextItem.isDirectory) {
        await fsp.rmdir(contextItem.path, { recursive: true });
      } else {
        await fsp.unlink(contextItem.path);
      }

      // Refresh the parent directory
      const tree = await buildFileTree(`/${activeProject.id}`);
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
      onFileSelect?.(item.path);
    }
  };

  const handleShowInTerminal = (item: FileSystemItem) => {
    const command = item.isDirectory ? `cd ${item.path}` : `cat ${item.path}`;
    console.log(`Terminal command: ${command}`);
  };

  const confirmRename = async () => {
    const renameValueTrimmed = renameValue.trim();

    if (!contextItem || !fsp || !activeProject || !renameValueTrimmed) return;

    try {
      const newPath = path.join(
        path.dirname(contextItem.path),
        renameValueTrimmed
      );
      await fsp.rename(contextItem.path, newPath);

      // Refresh the parent directory
      const tree = await buildFileTree(`/${activeProject.id}`);
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
                'flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded',
                selectedItem === item.path && 'bg-slate-200 dark:bg-slate-700'
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
                  {item.expanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
              )}

              {item.isDirectory ? (
                item.expanded ? (
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

        {item.isDirectory && item.expanded && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  }

  if (!activeProject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No active project
      </div>
    );
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
          renderFileTree(fileTree)
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
