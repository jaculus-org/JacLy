import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as fs from 'fs';
import type { IDbProject } from '@/types/project';
import {
  ProjectFsService,
  type ProjectFsInterface,
} from '@/services/project-fs-service';
import { ProjectLoadingIndicator } from '@/features/project/components/project-loading';
import { ProjectLoadError } from '@/features/project/components/project-load-error';
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

  // Mount filesystem
  useEffect(() => {
    let mounted = true;

    async function mountFs() {
      try {
        const interfce = await projectFsService.mount(project.id);
        if (mounted) {
          setFsInterface(interfce);
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
      projectFsService.unmount(project.id);
    };
  }, [project.id, projectFsService]);

  // // Initialize Monaco file indexing and watching after filesystem is mounted
  // useEffect(() => {
  //   if (!fsInterface) return;

  //   // Capture fsInterface in local const for TypeScript
  //   const currentFsInterface = fsInterface;
  //   let cleanupWatcher: (() => void) | undefined;

  //   async function initMonacoIntegration() {
  //     try {
  //       // Dynamically import Monaco to avoid issues with SSR
  //       const { loader } = await import('@monaco-editor/react');
  //       const monaco = await loader.init();

  //       // Import indexer functions
  //       const { indexMonacoFiles, watchMonacoFiles } = await import(
  //         '@/features/editor-code/lib/project-indexer'
  //       );

  //       // Index all project files for IntelliSense
  //       await indexMonacoFiles(
  //         monaco,
  //         currentFsInterface.projectPath,
  //         currentFsInterface.fs.promises as unknown as typeof fs.promises
  //       );

  //       // Watch for external file changes
  //       cleanupWatcher = watchMonacoFiles(
  //         monaco,
  //         currentFsInterface.projectPath,
  //         currentFsInterface.fs as unknown as typeof fs
  //       );
  //     } catch (err) {
  //       console.error('Failed to initialize Monaco integration:', err);
  //     }
  //   }

  //   initMonacoIntegration();

  //   return () => {
  //     cleanupWatcher?.();
  //   };
  // }, [fsInterface]);

  const getFileName = useCallback(
    (fileType: keyof typeof JaclyFiles) => {
      return `${fsInterface?.projectPath}/${JaclyFiles[fileType]}`;
    },
    [fsInterface?.projectPath]
  );

  const contextValue = useMemo<ActiveProjectContextValue | null>(() => {
    if (!fsInterface) return null;

    return {
      fs: fsInterface.fs as unknown as typeof fs,
      fsp: fsInterface.fs.promises as unknown as typeof fs.promises,
      dbProject: project,
      projectPath: fsInterface.projectPath,
      getFileName,
    };
  }, [fsInterface, project, getFileName]);

  if (error) {
    return <ProjectLoadError error={error} />;
  }

  if (!contextValue) {
    return <ProjectLoadingIndicator message="Mounting filesystem..." />;
  }

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
