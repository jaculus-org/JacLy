import { useJac } from '@/jaculus/provider/jac-context';
import FS from '@isomorphic-git/lightning-fs';
import { useEffect, useState, useCallback } from 'react';
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
  const { activeProject } = useJac();
  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [contextItem, setContextItem] = useState<FileSystemItem | null>(null);

  const fs = activeProject ? new FS(activeProject.id).promises : null;

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
      if (!fs) return [];

      try {
        const items = await fs.readdir(dirPath);
        const treeItems: FileSystemItem[] = [];

        for (const item of items) {
          const itemPath = dirPath === '/' ? `/${item}` : `${dirPath}/${item}`;

          try {
            const stat = await fs.stat(itemPath);
            const isDirectory = stat.type === 'dir';

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
    [fs]
  );

  // Load initial file tree
  useEffect(() => {
    if (!activeProject || !fs) {
      setFileTree([]);
      setLoading(false);
      return;
    }

    const loadFileTree = async () => {
      setLoading(true);
      try {
        const tree = await buildFileTree('/');
        setFileTree(tree);
      } catch (error) {
        console.error('Error loading file tree:', error);
      }
      setLoading(false);
    };

    loadFileTree();
  }, [activeProject, fs, buildFileTree]);

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

    setFileTree(updateTree(fileTree));

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

      setFileTree(updateTreeWithChildren(fileTree));
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
    if (!contextItem || !fs) return;

    try {
      if (contextItem.isDirectory) {
        await fs.rmdir(contextItem.path);
      } else {
        await fs.unlink(contextItem.path);
      }

      // Refresh the parent directory
      const tree = await buildFileTree('/');
      setFileTree(tree);

      console.log(`Deleted: ${contextItem.path}`);
    } catch (error) {
      console.error(`Error deleting ${contextItem.path}:`, error);
    }
  };

  const handleOpen = (item: FileSystemItem) => {
    if (item.isDirectory) {
      toggleDirectory(item);
    } else {
      console.log(`Opening file: ${item.path}`);
      onFileSelect?.(item.path);
    }
  };

  const handleShowInTerminal = (item: FileSystemItem) => {
    const command = item.isDirectory ? `cd ${item.path}` : `cat ${item.path}`;
    console.log(`Terminal command: ${command}`);
  };

  const confirmRename = async () => {
    if (!contextItem || !fs || !renameValue.trim()) return;

    try {
      const parentPath =
        contextItem.path.split('/').slice(0, -1).join('/') || '/';
      const newPath = `${parentPath}/${renameValue.trim()}`;

      // For files, we need to read and write the content
      if (!contextItem.isDirectory) {
        const content = await fs.readFile(contextItem.path);
        await fs.writeFile(newPath, content);
        await fs.unlink(contextItem.path);
      } else {
        // Directory renaming is more complex - for now just log
        console.log(
          `Would rename directory from ${contextItem.path} to ${newPath}`
        );
      }

      // Refresh tree
      const tree = await buildFileTree('/');
      setFileTree(tree);

      setRenameDialogOpen(false);
      setRenameValue('');
    } catch (error) {
      console.error(`Error renaming ${contextItem.path}:`, error);
    }
  };

  // Render file tree recursively
  const renderFileTree = (items: FileSystemItem[], depth = 0) => {
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
              onClick={() => {
                setSelectedItem(item.path);
                handleOpen(item);
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
            <ContextMenuItem onClick={() => handleOpen(item)}>
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
  };

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
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm text-foreground">
          {activeProject.name}
        </h3>
      </div>

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
