import {
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
import {
  ProjectLoadingIndicator,
  ProjectLoadError,
} from '@/features/project/components';
import { JaclyFiles } from '../types/jacly-files';
import {
  ActiveProjectContext,
  type ActiveProjectActions,
  type ActiveProjectContextValue,
  type ActiveProjectState,
} from './active-project-context';

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
  const [error, setError] = useState<ActiveProjectState['error']>(null);

  useEffect(() => {
    let mounted = true;

    async function mountFs() {
      try {
        const interfce = await projectFsService.mount(project.id);
        if (mounted) {
          setFsInterface(interfce);
        }
      } catch {
        if (mounted) {
          setError({ reason: 'fs-mount-failed', seriousness: 'unrecoverable' });
        }
      }
    }

    mountFs();

    return () => {
      mounted = false;
      projectFsService.unmount(project.id);
      setError(null);
    };
  }, [project.id, projectFsService]);

  const getFileName = useCallback(
    (fileType: keyof typeof JaclyFiles) => {
      return `${fsInterface?.projectPath}/${JaclyFiles[fileType]}`;
    },
    [fsInterface?.projectPath]
  );

  const state = useMemo<ActiveProjectState | null>(() => {
    if (!fsInterface) return null;

    return {
      fs: fsInterface.fs as unknown as typeof fs,
      fsp: fsInterface.fs.promises as unknown as typeof fs.promises,
      dbProject: project,
      projectPath: fsInterface.projectPath,
      error,
    };
  }, [fsInterface, project, error]);

  const actions = useMemo<ActiveProjectActions>(
    () => ({
      setError,
      getFileName,
    }),
    [setError, getFileName]
  );

  const contextValue = useMemo<ActiveProjectContextValue | null>(() => {
    if (!state) return null;

    return {
      state,
      actions,
      meta: { projectId: project.id },
    };
  }, [state, actions, project.id]);

  if (error && error.seriousness === 'unrecoverable') {
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
