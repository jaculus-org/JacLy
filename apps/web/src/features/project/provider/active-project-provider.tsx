import { createContext, useEffect, useState, type ReactNode } from 'react';
import * as fs from 'fs';
import type { IProject } from '@/types/project';
import {
  ProjectFsService,
  type ProjectFsInterface,
} from '@/services/project-fs-service';
import { EditorMountLoading } from '@/features/project/components/editor-loading';
import { EditorLoadError } from '@/features/project/components/editor-load-error';
import { indexMonacoFiles } from '@/features/editor/lib/project-indexer';
import { useMonaco } from '@monaco-editor/react';

export interface ActiveProjectContextValue {
  fs: typeof fs;
  fsp: typeof fs.promises;
  project: IProject;
  projectPath: string;
}

export const ActiveProjectContext =
  createContext<ActiveProjectContextValue | null>(null);

interface ActiveProjectProviderProps {
  project: IProject;
  projectFsService: ProjectFsService;
  children: ReactNode;
}

export function ActiveProjectProvider({
  project,
  projectFsService,
  children,
}: ActiveProjectProviderProps) {
  const [fsInterface, setFsInterface] = useState<ProjectFsInterface | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    let mounted = true;

    async function mountFs() {
      try {
        const result = await projectFsService.mount(project.id);
        if (mounted) {
          indexMonacoFiles(
            monaco,
            result.projectPath,
            result.fs.promises as unknown as typeof fs.promises
          );
          setFsInterface(result);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to mount filesystem')
          );
        }
      }
    }

    mountFs();

    return () => {
      mounted = false;
      // Unmount when leaving the project
      projectFsService.unmount(project.id);
    };
  }, [project.id, projectFsService, monaco]);

  if (error) {
    return <EditorLoadError error={error} />;
  }

  if (!fsInterface) {
    return <EditorMountLoading message="Mounting filesystem..." />;
  }

  const contextValue: ActiveProjectContextValue = {
    fs: fsInterface.fs as unknown as typeof fs,
    fsp: fsInterface.fs.promises as unknown as typeof fs.promises,
    project,
    projectPath: fsInterface.projectPath,
  };

  return (
    <ActiveProjectContext.Provider value={contextValue}>
      {children}
    </ActiveProjectContext.Provider>
  );
}
