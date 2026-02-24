'use client';

import { m } from '@/paraglide/messages';
import logger from '@/features/jac-device/lib/logger';
import { useJacDevice } from '@/features/jac-device';
import { enqueueSnackbar } from 'notistack';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useActiveProject } from '@/features/project/active-project';
import { useProjectEditor } from '@/features/project/editor';
import path from 'path';
import type { Dependencies } from '@jaculus/project/package';
import { InvalidPackageJsonFormatError } from '@jaculus/project/package';
import { ProjectDependencyError } from '@jaculus/project';
import { RegistryFetchError } from '@jaculus/project/registry';
import { JacPackagesContext } from './jac-packages-context';

export function JacPackagesProvider({ children }: { children: ReactNode }) {
  const { state: jacState, actions: jacActions } = useJacDevice();
  const {
    actions: { controlPanel },
  } = useProjectEditor();
  const { jacProject } = jacState;
  const { reloadNodeModules } = jacActions;
  const {
    state: { projectPath, fs },
  } = useActiveProject();

  function classifyError(err: unknown, fallback: string): string {
    if (err instanceof ProjectDependencyError) {
      if (err.conflictingLib && err.requested && err.resolved) {
        return (
          m.project_panel_pkg_dependency_conflict() +
          ': ' +
          m.project_panel_pkg_dependency_conflict_detail({
            lib: err.conflictingLib,
            requested: err.requested,
            resolved: err.resolved,
          })
        );
      }
      return m.project_panel_pkg_dependency_conflict() + ` (${err.message})`;
    }
    if (err instanceof RegistryFetchError)
      return m.project_panel_pkg_fetch_error() + ` (${err.message})`;
    if (err instanceof InvalidPackageJsonFormatError) return err.message;
    return err instanceof Error ? err.message : fallback;
  }

  const [installedLibs, setInstalledLibs] = useState<Dependencies>({});
  const [availableLibs, setAvailableLibs] = useState<string[]>([]);
  const [availableLibVersions, setAvailableLibVersions] = useState<string[]>(
    []
  );

  const [selectedLib, setSelectedLib] = useState<string | null>(null);
  const [selectedLibVersion, setSelectedLibVersion] = useState<string | null>(
    null
  );

  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setErrorAndLogPanel = useCallback(
    (message: string) => {
      setError(message);
      controlPanel('logs', 'expand');
    },
    [controlPanel]
  );

  const availableLibChoices = useMemo(
    () => availableLibs.filter(lib => !(lib in installedLibs)),
    [availableLibs, installedLibs]
  );

  const selectLib = useCallback((value: string | null) => {
    setSelectedLib(value);
  }, []);

  const selectLibVersion = useCallback((value: string | null) => {
    setSelectedLibVersion(value);
  }, []);

  const installAll = useCallback(async () => {
    if (!jacProject) return;
    try {
      setIsInstalling(true);
      setError(null);
      setInstalledLibs(await jacProject.install());
      reloadNodeModules();
    } catch (err) {
      setErrorAndLogPanel(
        classifyError(err, m.project_panel_pkg_install_error())
      );
      logger.error('Error installing library:' + err);
    } finally {
      setIsInstalling(false);
    }
  }, [jacProject, reloadNodeModules, setErrorAndLogPanel]);

  const addLibrary = useCallback(async () => {
    if (!jacProject) return;
    try {
      setIsInstalling(true);
      setError(null);
      if (selectedLib == null || availableLibVersions.length === 0) {
        setErrorAndLogPanel(m.project_panel_pkg_select_error());
        return;
      }
      const versionToInstall = selectedLibVersion ?? availableLibVersions[0];
      setInstalledLibs(
        await jacProject.addLibraryVersion(selectedLib, versionToInstall)
      );
      reloadNodeModules();
      enqueueSnackbar(
        m.project_panel_pkg_added({
          name: selectedLib,
          version: versionToInstall,
        }),
        { variant: 'success' }
      );
    } catch (err) {
      setErrorAndLogPanel(classifyError(err, m.project_panel_pkg_add_error()));
      logger.error('Error adding library:' + err);
    } finally {
      setIsInstalling(false);
      setSelectedLib(null);
      setSelectedLibVersion(null);
    }
  }, [
    jacProject,
    selectedLib,
    selectedLibVersion,
    availableLibVersions,
    reloadNodeModules,
    setErrorAndLogPanel,
  ]);

  const removeLibrary = useCallback(
    async (library: string) => {
      if (!jacProject) return;
      try {
        setIsInstalling(true);
        setError(null);
        setInstalledLibs(await jacProject.removeLibrary(library));
        reloadNodeModules();
        enqueueSnackbar(m.project_panel_pkg_removed({ name: library }), {
          variant: 'success',
        });
      } catch (err) {
        setErrorAndLogPanel(
          classifyError(err, m.project_panel_pkg_remove_error())
        );
        logger.error('Error removing library:' + err);
      } finally {
        setIsInstalling(false);
      }
    },
    [jacProject, reloadNodeModules, setErrorAndLogPanel]
  );

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        if (jacProject == null || jacProject.registry == null) return;
        setAvailableLibs(await jacProject.registry.listPackages());
        setInstalledLibs(await jacProject.installedLibraries());
      } catch (err) {
        setErrorAndLogPanel(
          classifyError(err, m.project_panel_pkg_load_error())
        );
        logger.error('Error loading libraries:' + err);
      }
    })();
  }, [jacProject, setErrorAndLogPanel]);

  useEffect(() => {
    (async () => {
      if (jacProject == null || jacProject.registry == null) return;
      if (!fs.existsSync(path.join(projectPath, 'node_modules'))) {
        try {
          setIsInstalling(true);
          setError(null);
          setInstalledLibs(await jacProject.install());
          reloadNodeModules();
        } catch (err) {
          setErrorAndLogPanel(
            classifyError(err, m.project_panel_pkg_install_error())
          );
          logger.error('Error installing library:' + err);
        } finally {
          setIsInstalling(false);
        }
      }
    })();
  }, [fs, jacProject, projectPath, reloadNodeModules, setErrorAndLogPanel]);

  useEffect(() => {
    (async () => {
      try {
        if (
          jacProject == null ||
          selectedLib == null ||
          jacProject.registry == null
        ) {
          setAvailableLibVersions([]);
          return;
        }
        setError(null);
        const versions = await jacProject.registry.listVersions(selectedLib);
        setAvailableLibVersions(versions);

        if (versions.length == 1) {
          setSelectedLibVersion(versions[0]);
        } else {
          setSelectedLibVersion(null);
        }
      } catch (err) {
        setErrorAndLogPanel(
          classifyError(err, m.project_panel_pkg_versions_error())
        );
        logger.error('Error loading library versions:' + err);
      }
    })();
  }, [selectedLib, jacProject, setErrorAndLogPanel]);

  const hasProject = jacProject != null;

  return (
    <JacPackagesContext.Provider
      value={{
        state: {
          installedLibs,
          availableLibChoices,
          availableLibVersions,
          selectedLib,
          selectedLibVersion,
          isInstalling,
          error,
        },
        actions: {
          selectLib,
          selectLibVersion,
          installAll,
          addLibrary,
          removeLibrary,
        },
        meta: { hasProject },
      }}
    >
      {children}
    </JacPackagesContext.Provider>
  );
}
