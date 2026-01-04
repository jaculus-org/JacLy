import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { fs as FsType } from '@zenfs/core';
import type { IProject } from '@/types/project';
import {
  ProjectFsService,
  type ProjectFsInterface,
} from '@/services/project-fs-service';
import { EditorMountLoading } from '@/features/editor/components/editor-mount-loading';
import { EditorLoadError } from '@/features/editor/components/editor-load-error';

export interface ActiveProjectContextValue {
  fs: typeof FsType;
  fsp: typeof FsType.promises;
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

  useEffect(() => {
    let mounted = true;

    async function mountFs() {
      try {
        const result = await projectFsService.mount(project.id);
        if (mounted) {
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
  }, [project.id, projectFsService]);

  if (error) {
    return <EditorLoadError error={error} />;
  }

  if (!fsInterface) {
    return <EditorMountLoading />;
  }

  const contextValue: ActiveProjectContextValue = {
    fs: fsInterface.fs,
    fsp: fsInterface.fs.promises,
    project,
    projectPath: fsInterface.projectPath,
  };

  return (
    <ActiveProjectContext.Provider value={contextValue}>
      {children}
    </ActiveProjectContext.Provider>
  );
}
