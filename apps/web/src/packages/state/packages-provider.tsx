'use client';

import path from 'node:path';
import { ProjectDependencyError } from '@jaculus/project';
import type { Dependencies } from '@jaculus/project/package';
import { InvalidPackageJsonFormatError } from '@jaculus/project/package';
import { RegistryFetchError, type RegistryListProject } from '@jaculus/project/registry';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/core';
import { m } from '@/core/paraglide/messages';
import { useJacDevice } from '@/device';
import { flushSaveService } from '@/editor/services/flush-save-service';
import { useActiveProject, useProjectEditor } from '@/project';
import { packageEventsService } from '../services/package-events-service';
import type { LoadStatus } from './packages-context';
import { JacPackagesContext } from './packages-context';

export function JacPackagesProvider({ children }: { children: ReactNode }) {
  const { state: jacState } = useJacDevice();
  const {
    actions: { controlPanel },
  } = useProjectEditor();
  const { jacProject, jacRegistry } = jacState;
  const {
    state: { projectPath, fs },
  } = useActiveProject();

  const classifyError = useCallback((err: unknown, fallback: string): string => {
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
      return `${m.project_panel_pkg_dependency_conflict()} (${err.message})`;
    }
    if (err instanceof RegistryFetchError)
      return `${m.project_panel_pkg_fetch_error()} (${err.message})`;
    if (err instanceof InvalidPackageJsonFormatError) return err.message;
    return err instanceof Error ? err.message : fallback;
  }, []);

  const [installedLibs, setInstalledLibs] = useState<Dependencies>({});
  const [availableLibs, setAvailableLibs] = useState<RegistryListProject[]>([]);
  const [availableLibVersions, setAvailableLibVersions] = useState<string[]>([]);

  const [selectedLib, setSelectedLib] = useState<string | null>(null);
  const [selectedLibVersion, setSelectedLibVersion] = useState<string | null>(null);

  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [initialInstallDone, setInitialInstallDone] = useState<boolean>(() =>
    fs.existsSync(path.join(projectPath, 'node_modules')),
  );
  const [error, setError] = useState<string | null>(null);

  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  const setErrorAndLogPanel = useCallback(
    (message: string) => {
      setError(message);
      controlPanel('logs', 'expand');
    },
    [controlPanel],
  );

  const availableLibChoices = useMemo(
    () => availableLibs.filter((lib) => !(lib.id in installedLibs)),
    [availableLibs, installedLibs],
  );

  const selectLib = useCallback((value: string | null) => {
    setSelectedLib(value);
  }, []);

  const selectLibVersion = useCallback((value: string | null) => {
    setSelectedLibVersion(value);
  }, []);

  const retryLoad = useCallback(() => {
    setLoadStatus('idle');
    setLoadError(null);
  }, []);

  const installAll = useCallback(async () => {
    if (!jacProject || !jacRegistry) return;
    try {
      setIsInstalling(true);
      setError(null);
      await flushSaveService.flush();
      setInstalledLibs(await jacProject.install(jacRegistry));
      packageEventsService.notifyPackagesChanged();
    } catch (err) {
      setErrorAndLogPanel(classifyError(err, m.project_panel_pkg_install_error()));
      logger.error(`Error installing library:${err}`);
    } finally {
      setIsInstalling(false);
    }
  }, [jacProject, jacRegistry, setErrorAndLogPanel, classifyError]);

  const addLibrary = useCallback(async () => {
    if (!jacProject || !jacRegistry) return;
    try {
      setIsInstalling(true);
      setError(null);
      await flushSaveService.flush();
      if (selectedLib == null || availableLibVersions.length === 0) {
        setErrorAndLogPanel(m.project_panel_pkg_select_error());
        return;
      }
      const versionToInstall = selectedLibVersion ?? availableLibVersions[0];
      setInstalledLibs(
        await jacProject.addLibraryVersion(jacRegistry, selectedLib, versionToInstall),
      );
      packageEventsService.notifyPackagesChanged();
      enqueueSnackbar(
        m.project_panel_pkg_added({
          name: selectedLib,
          version: versionToInstall,
        }),
        { variant: 'success' },
      );
    } catch (err) {
      setErrorAndLogPanel(classifyError(err, m.project_panel_pkg_add_error()));
      logger.error(`Error adding library:${err}`);
    } finally {
      setIsInstalling(false);
      setSelectedLib(null);
      setSelectedLibVersion(null);
    }
  }, [
    jacProject,
    jacRegistry,
    selectedLib,
    selectedLibVersion,
    availableLibVersions,
    setErrorAndLogPanel,
    classifyError,
  ]);

  const removeLibrary = useCallback(
    async (library: string) => {
      if (!jacProject || !jacRegistry) return;
      try {
        setIsInstalling(true);
        setError(null);
        await flushSaveService.flush();
        setInstalledLibs(await jacProject.removeLibrary(jacRegistry, library));
        packageEventsService.notifyPackagesChanged();
        enqueueSnackbar(m.project_panel_pkg_removed({ name: library }), {
          variant: 'success',
        });
      } catch (err) {
        setErrorAndLogPanel(classifyError(err, m.project_panel_pkg_remove_error()));
        logger.error(`Error removing library:${err}`);
      } finally {
        setIsInstalling(false);
      }
    },
    [jacProject, jacRegistry, setErrorAndLogPanel, classifyError],
  );

  useEffect(() => {
    if (loadStatus !== 'idle') return;
    if (jacProject == null || jacRegistry == null) return;

    setLoadStatus('loading');

    (async () => {
      try {
        const [libs, deps] = await Promise.all([
          jacRegistry.listPackages(),
          jacProject.listDependencies(),
        ]);
        setAvailableLibs(libs);
        setInstalledLibs(deps);
        setLoadStatus('success');
      } catch (err) {
        setLoadError(classifyError(err, m.project_panel_pkg_load_error()));
        setLoadStatus('error');
        logger.error(`Error loading libraries: ${err}`);
      }
    })();
  }, [loadStatus, jacProject, jacRegistry, classifyError]);

  useEffect(() => {
    (async () => {
      if (jacProject == null || jacRegistry == null) return;
      if (!fs.existsSync(path.join(projectPath, 'node_modules'))) {
        try {
          setIsInstalling(true);
          setError(null);
          setInstalledLibs(await jacProject.install(jacRegistry));
          packageEventsService.notifyPackagesChanged();
        } catch (err) {
          setErrorAndLogPanel(classifyError(err, m.project_panel_pkg_install_error()));
          logger.error(`Error installing library:${err}`);
        } finally {
          setIsInstalling(false);
          setTimeout(() => setInitialInstallDone(true), 100);
        }
      }
    })();
  }, [fs, jacProject, jacRegistry, projectPath, setErrorAndLogPanel, classifyError]);

  useEffect(() => {
    (async () => {
      try {
        if (jacProject == null || selectedLib == null || jacRegistry == null) {
          setAvailableLibVersions([]);
          return;
        }
        setError(null);
        const versions = await jacRegistry.listVersions(selectedLib);
        setAvailableLibVersions(versions);

        if (versions.length === 1) {
          setSelectedLibVersion(versions[0]);
        } else {
          setSelectedLibVersion(null);
        }
      } catch (err) {
        setErrorAndLogPanel(classifyError(err, m.project_panel_pkg_versions_error()));
        logger.error(`Error loading library versions:${err}`);
      }
    })();
  }, [selectedLib, jacProject, jacRegistry, setErrorAndLogPanel, classifyError]);

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
          initialInstallDone,
          error,
          loadStatus,
          loadError,
        },
        actions: {
          selectLib,
          selectLibVersion,
          installAll,
          addLibrary,
          removeLibrary,
          retryLoad,
        },
        meta: { hasProject },
      }}
    >
      {children}
    </JacPackagesContext.Provider>
  );
}
