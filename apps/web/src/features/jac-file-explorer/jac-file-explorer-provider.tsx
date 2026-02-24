'use client';

import { m } from '@/paraglide/messages';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { enqueueSnackbar } from 'notistack';
import { useActiveProject } from '@/features/project/active-project';
import { useProjectEditor } from '@/features/project/editor';
import { debounce } from '@/lib/utils/debouncer';
import { JacFileExplorerContext } from './jac-file-explorer-context';
import type { FileSystemItem } from './file-explorer-types';
import { buildFileTree, loadDirectoryChildren } from './file-explorer-helpers';

export function JacFileExplorerProvider({ children }: { children: ReactNode }) {
  const {
    state: { fsp, projectPath },
  } = useActiveProject();
  const { actions } = useProjectEditor();
  const { openPanel } = actions;

  const [fileTree, setFileTree] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const expandedFoldersRef = useRef(expandedFolders);

  const rootItem: FileSystemItem = {
    isRoot: true,
    name: projectPath,
    path: projectPath,
    isDirectory: true,
    children: [],
  };

  useEffect(() => {
    expandedFoldersRef.current = expandedFolders;
  }, [expandedFolders]);

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

  useEffect(() => {
    void refreshTree(false);
  }, [refreshTree]);

  useEffect(() => {
    if (!projectPath || !fsp.watch) return;

    let aborted = false;
    const abortController = new AbortController();

    const debouncedRefresh = debounce(() => {
      if (!aborted) {
        void refreshTree(true);
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

  const openItem = useCallback(
    (item: FileSystemItem) => {
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

  const selectItem = useCallback((path: string) => {
    setSelectedItem(path);
  }, []);

  const createNewFile = useCallback(
    async (item: FileSystemItem) => {
      const fileName = prompt(
        m.project_panel_fs_create_file_prompt({ path: item.path })
      );
      if (!fileName) return;
      try {
        await fsp.writeFile(`${item.path}/${fileName}`, '', 'utf-8');
        openPanel('code', {
          filePath: `${item.path}/${fileName}`.replace(`${projectPath}/`, ''),
        });
      } catch {
        enqueueSnackbar(m.project_panel_fs_create_file_error(), {
          variant: 'error',
        });
      }
    },
    [fsp, openPanel, projectPath]
  );

  const createNewDirectory = useCallback(
    async (item: FileSystemItem) => {
      const dirName = prompt(
        m.project_panel_fs_create_folder_prompt({ path: item.path })
      );
      if (!dirName) return;
      try {
        await fsp.mkdir(`${item.path}/${dirName}`);
      } catch {
        enqueueSnackbar(m.project_panel_fs_create_folder_error(), {
          variant: 'error',
        });
      }
    },
    [fsp]
  );

  const renameItem = useCallback(
    async (item: FileSystemItem) => {
      const newName = prompt(
        m.project_panel_fs_rename_prompt({ name: item.name }),
        item.name
      );
      if (!newName || newName === item.name) return;
      try {
        const newPath = item.path.replace(/[^/]+$/, newName);
        await fsp.rename(item.path, newPath);
      } catch {
        enqueueSnackbar(m.project_panel_fs_rename_error(), {
          variant: 'error',
        });
      }
    },
    [fsp]
  );

  const removeItem = useCallback(
    async (item: FileSystemItem) => {
      if (!confirm(m.project_panel_fs_delete_confirm({ name: item.name })))
        return;
      try {
        if (item.isDirectory)
          await fsp.rm(item.path, { recursive: true, force: true });
        else await fsp.unlink(item.path);
      } catch {
        enqueueSnackbar(m.project_panel_fs_delete_error(), {
          variant: 'error',
        });
      }
    },
    [fsp]
  );

  const copyPath = useCallback(
    (item: FileSystemItem) => {
      void navigator.clipboard.writeText(
        item.path.replace(`${projectPath}`, '')
      );
    },
    [projectPath]
  );

  return (
    <JacFileExplorerContext.Provider
      value={{
        state: { fileTree, selectedItem, loading, expandedFolders },
        actions: {
          refreshTree,
          openItem,
          toggleDirectory,
          selectItem,
          createNewFile,
          createNewDirectory,
          renameItem,
          removeItem,
          copyPath,
        },
        meta: { rootItem, hasProject: Boolean(projectPath) },
      }}
    >
      {children}
    </JacFileExplorerContext.Provider>
  );
}
