import type * as fs from 'node:fs';
import path from 'node:path';
import { loadPackageJson, savePackageJson } from '@jaculus/project/package';
import { useMonaco } from '@monaco-editor/react';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { IDbProject } from '@/core/types/project';
import { ProjectLoadError } from '../components/project-load-error';
import { ProjectLoadingIndicator } from '../components/project-loading';
import { MonacoService } from '../services/monaco-service';
import type { ProjectFsInterface, ProjectFsService } from '../services/project-fs-service';
import type { ProjectManagementService } from '../services/project-runtime-service';
import { TypeScriptIntelliSenseService } from '../services/ts-intellisense-service';
import { JaclyFiles } from '../types/jacly-files';
import {
  type ActiveProjectActions,
  ActiveProjectContext,
  type ActiveProjectContextValue,
  type ActiveProjectState,
} from './active-project-context';

interface ActiveProjectProviderProps {
  dbProject: IDbProject;
  projectFsService: ProjectFsService;
  projectManService: ProjectManagementService;
  children: ReactNode;
}

function toPackageName(name: string): string {
  return name.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '-');
}

export function ActiveProjectProvider({
  dbProject: project,
  projectFsService,
  projectManService,
  children,
}: ActiveProjectProviderProps) {
  const monaco = useMonaco();
  const [currentProject, setCurrentProject] = useState<IDbProject>(project);
  const [fsInterface, setFsInterface] = useState<ProjectFsInterface | null>(null);
  const [error, setError] = useState<ActiveProjectState['error']>(null);
  const [monacoService, setMonacoService] = useState<MonacoService | null>(null);

  useEffect(() => {
    let mounted = true;
    let service: MonacoService | null = null;
    let tsService: TypeScriptIntelliSenseService | null = null;

    async function mountFs() {
      try {
        const interfce = await projectFsService.mount(project.id);

        if (mounted && monaco) {
          setFsInterface(interfce);
          service = new MonacoService(interfce.fs, monaco, `/${project.id}`);
          tsService = new TypeScriptIntelliSenseService(interfce.fs, monaco, `/${project.id}`);
          service.setTsService(tsService);
          setMonacoService(service);
        }
      } catch {
        if (mounted) {
          setError({ reason: 'fs-mount-failed', seriousness: 'unrecoverable' });
        }
      }
    }

    mountFs();

    return () => {
      projectManService.touchProject(project.id);
      mounted = false;
      projectFsService.unmount(project.id);
      tsService?.dispose();
      service?.dispose();
      setMonacoService(null);
      setError(null);
    };
  }, [project.id, projectFsService, projectManService, monaco]);

  const getFileName = useCallback(
    (fileType: keyof typeof JaclyFiles) => {
      return `${fsInterface?.projectPath}/${JaclyFiles[fileType]}`;
    },
    [fsInterface?.projectPath],
  );

  const renameProject = useCallback(
    async (newName: string) => {
      const projectNamePatternJson = /^[a-z0-9-_]+$/;
      const projectId = project.id;
      const nextNamePackage = toPackageName(newName);

      if (projectNamePatternJson.test(nextNamePackage)) {
        await projectFsService.withMount(projectId, async ({ fs: mountedFs, projectPath }) => {
          const packageJsonPath = path.join(projectPath, 'package.json');
          const pkgJson = await loadPackageJson(mountedFs, packageJsonPath);
          await savePackageJson(mountedFs, packageJsonPath, {
            ...pkgJson,
            name: nextNamePackage,
          });
        });
      }

      await projectManService.renameProject(projectId, newName);
      setCurrentProject((prev) => ({ ...prev, name: newName }));
    },
    [project.id, projectFsService, projectManService],
  );

  const state = useMemo<ActiveProjectState | null>(() => {
    if (!fsInterface) return null;

    return {
      fs: fsInterface.fs as unknown as typeof fs,
      fsp: fsInterface.fs.promises as unknown as typeof fs.promises,
      dbProject: currentProject,
      projectPath: fsInterface.projectPath,
      error,
      monacoService,
    };
  }, [fsInterface, currentProject, error]);

  const actions = useMemo<ActiveProjectActions>(
    () => ({
      setError,
      getFileName,
      renameProject,
    }),
    [getFileName, renameProject],
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
    <ActiveProjectContext.Provider value={contextValue}>{children}</ActiveProjectContext.Provider>
  );
}
