import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as fs from 'fs';
import path from 'path';
import type { IDbProject } from '@/types/project';
import {
  ProjectFsService,
  type ProjectFsInterface,
} from '@/services/project-fs-service';
import type { ProjectManagementService } from '@/services/project-runtime-service';
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
import { loadPackageJson, savePackageJson } from '@jaculus/project/package';

interface ActiveProjectProviderProps {
  dbProject: IDbProject;
  projectFsService: ProjectFsService;
  projectManService: ProjectManagementService;
  children: ReactNode;
}

export function ActiveProjectProvider({
  dbProject: project,
  projectFsService,
  projectManService,
  children,
}: ActiveProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<IDbProject>(project);
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

  const renameProject = useCallback(
    async (newName: string) => {
      const projectNamePatternJson = /^[a-z0-9-_]+$/;
      const projectId = project.id;
      const nextNamePackage = newName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-_]/g, '-');

      if (projectNamePatternJson.test(nextNamePackage)) {
        await projectFsService.withMount(
          projectId,
          async ({ fs: mountedFs, projectPath }) => {
            const packageJsonPath = path.join(projectPath, 'package.json');
            const pkgJson = await loadPackageJson(mountedFs, packageJsonPath);
            await savePackageJson(mountedFs, packageJsonPath, {
              ...pkgJson,
              name: nextNamePackage,
            });
          }
        );
      }

      await projectManService.renameProject(projectId, newName);

      // Update local state so the UI reflects the new name without reload
      setCurrentProject(prev => ({ ...prev, name: newName }));
    },
    [project.id, projectFsService, projectManService]
  );

  const state = useMemo<ActiveProjectState | null>(() => {
    if (!fsInterface) return null;

    return {
      fs: fsInterface.fs as unknown as typeof fs,
      fsp: fsInterface.fs.promises as unknown as typeof fs.promises,
      dbProject: currentProject,
      projectPath: fsInterface.projectPath,
      error,
    };
  }, [fsInterface, currentProject, error]);

  const actions = useMemo<ActiveProjectActions>(
    () => ({
      setError,
      getFileName,
      renameProject,
    }),
    [setError, getFileName, renameProject]
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
