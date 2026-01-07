import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import * as fs from 'fs';
import type { IDbProject } from '@/types/project';
import {
  ProjectFsService,
  type ProjectFsInterface,
} from '@/services/project-fs-service';
import { ProjectLoadingIndicator } from '@/features/project/components/project-loading';
import { ProjectLoadError } from '@/features/project/components/project-load-error';
import { indexMonacoFiles } from '@/features/code-editor/lib/project-indexer';
import { useMonaco } from '@monaco-editor/react';
import { JaclyFiles } from '../types/jacly-files';
export interface ActiveProjectContextValue {
  fs: typeof fs;
  fsp: typeof fs.promises;
  dbProject: IDbProject;
  projectPath: string;
  getFileName(fileType: keyof typeof JaclyFiles): string;
}

export const ActiveProjectContext =
  createContext<ActiveProjectContextValue | null>(null);

interface ActiveProjectProviderProps {
  dbProject: IDbProject;
  projectFsService: ProjectFsService;
  children: ReactNode;
}

export function ActiveProjectProvider({
  dbProject: project,
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
    return <ProjectLoadError error={error} />;
  }

  if (!fsInterface) {
    return <ProjectLoadingIndicator message="Mounting filesystem..." />;
  }

  const contextValue: ActiveProjectContextValue = {
    fs: fsInterface.fs as unknown as typeof fs,
    fsp: fsInterface.fs.promises as unknown as typeof fs.promises,
    dbProject: project,
    projectPath: fsInterface.projectPath,
    getFileName(fileType) {
      return `${fsInterface.projectPath}/${JaclyFiles[fileType]}`;
    },
  };

  return (
    <ActiveProjectContext.Provider value={contextValue}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject(): ActiveProjectContextValue {
  const context = use(ActiveProjectContext);
  if (!context) {
    throw new Error(
      'useActiveProject must be used within an ActiveProjectProvider'
    );
  }
  return context;
}
