import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/features/shared/components/ui/context-menu';
import { useActiveProject } from '@/hooks/use-active-project';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { useState, useEffect, type JSX, useEffectEvent } from 'react';
import type { FileSystemItem } from './types';
import { getFileIcon, buildFileTree, loadDirectoryChildren } from './helper';
import { useEditor } from '@/features/editor/provider/layout-provider';

export function FileExplorerPanel() {
  const { fsp, projectPath } = useActiveProject();
  const { openPanel } = useEditor();

  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

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

  async function handleOpen(item: FileSystemItem) {
    if (item.isDirectory) {
      await toggleDirectory(item);
    } else {
      const path = item.path.replace(`${projectPath}/`, '');
      openPanel('source-code', { filePath: path });
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

          <ContextMenuContent>
            <ContextMenuItem onClick={async () => await handleOpen(item)}>
              {item.isDirectory ? 'Open Folder' : 'Open File'}
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

  return (
    <div className="flex-1 overflow-auto p-1">
      {loading ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          Loading files...
        </div>
      ) : fileTree.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No files found
        </div>
      ) : (
        renderFileTree(fileTree)
      )}
    </div>
  );
}
