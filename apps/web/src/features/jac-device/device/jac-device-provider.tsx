import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { JacDevice } from '@jaculus/device';
import { getRequest } from '@jaculus/jacly/project';
import path from 'path';
import { useActiveProject } from '@/features/project/active-project';
import { enqueueSnackbar } from 'notistack';
import type { ConnectionStatus, ConnectionType } from '../types/connection';
import { useKeyboardShortcut } from '@/features/project/hooks/use-keyboard-shortcut';
import { m } from '@/paraglide/messages';
import { restart, uploadCode } from '../lib/device';
import {
  InvalidPackageJsonFormatError,
  loadPackageJson,
  savePackageJson,
  type PackageJson,
} from '@jaculus/project/package';
import { Project } from '@jaculus/project';
import { Registry } from '@jaculus/project/registry';
import { Route } from '@/routes/__root';
import {
  JacDeviceContext,
  type JacDeviceActions,
  type JacDeviceContextValue,
  type JacDeviceState,
} from './jac-device-context';
import { useBuildInfo } from '@/hooks/use-build-info';
import { logger } from '@/services/logger-service';

interface JacDeviceProviderProps {
  children: ReactNode;
}

export function JacDeviceProvider({ children }: JacDeviceProviderProps) {
  const { streamBusService } = Route.useRouteContext();
  const buildInfo = useBuildInfo();
  const { state: projectState, actions: projectActions } = useActiveProject();
  const { fs, projectPath } = projectState;
  const { setError } = projectActions;
  const [device, setDevice] = useState<JacDevice | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    null
  );

  const [jacProject, setJacProject] = useState<Project | null>(null);
  const [jacRegistry, setJacRegistry] = useState<Registry | null>(null);
  const [pkg, setPkg] = useState<PackageJson | null>(null);

  const [nodeModulesVersion, setNodeModulesVersion] = useState(0);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');

  useKeyboardShortcut(
    { key: 'r', ctrl: true, meta: true, shift: false },
    async () => {
      if (!device) return;
      await restart(device);
      enqueueSnackbar(m.jac_device_provider_restart(), { variant: 'success' });
    }
  );

  useKeyboardShortcut({ key: 'u', ctrl: true, meta: true }, async () => {
    if (!device) return;
    await uploadCode(await jacProject!.getFlashFiles(), device);
    enqueueSnackbar(m.jac_device_provider_upload_code(), {
      variant: 'success',
    });
  });

  const fixMissingPackageJson = useCallback(
    async (packageJsonPath: string) => {
      const defaultPackageJson: PackageJson = {
        name: 'jacly-project',
        version: '1.0.0',
        dependencies: {},
      };
      try {
        await fs.promises.writeFile(
          packageJsonPath,
          JSON.stringify(defaultPackageJson, null, 2),
          'utf-8'
        );
        setError(null);
        enqueueSnackbar(m.project_error_fix(), { variant: 'success' });
        setInterval(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Failed to create default package.json:', error);
        enqueueSnackbar(m.project_error_unknown(), { variant: 'error' });
      }
    },
    [fs, setError]
  );

  const initPackageJson = useCallback(
    async (pkg: PackageJson) => {
      let changed = false;
      if (!pkg.jaculus?.jaclyVersion) {
        pkg.jaculus = {
          jaclyVersion: buildInfo.version,
        };
        changed = true;
      } else if (pkg.jaculus.jaclyVersion !== buildInfo.version) {
        enqueueSnackbar(m.jac_device_provider_outdated_package_json(), {
          variant: 'warning',
        });
      }

      if (!pkg.jaculus?.jaclyGitHash) {
        pkg.jaculus.jaclyGitHash = buildInfo.commitHash;
        changed = true;
      }

      if (changed) {
        try {
          await savePackageJson(
            fs,
            path.join(projectPath, 'package.json'),
            pkg
          );
        } catch (error) {
          console.error('Failed to update package.json:', error);
          enqueueSnackbar(m.project_error_unknown(), { variant: 'error' });
        }
      }
    },
    [fs, projectPath, buildInfo]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      const packageJsonPath = path.join(projectPath, 'package.json');
      try {
        if (!fs.existsSync(packageJsonPath)) {
          if (!cancelled) {
            setJacProject(null);
            setPkg(null);
            setError({
              reason: 'missing-package-json',
              seriousness: 'recoverable',
              fixCallback: () => fixMissingPackageJson(packageJsonPath),
            });
          }
          return;
        }
        const pkgJson = await loadPackageJson(fs, packageJsonPath);
        await initPackageJson(pkgJson);
        setJacRegistry(new Registry(pkgJson.registry, getRequest, logger));

        if (!cancelled) {
          setJacProject(new Project(fs, projectPath, logger));
          setPkg(pkgJson);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        if (error instanceof InvalidPackageJsonFormatError) {
          setError({
            reason: 'invalid-package-json',
            seriousness: 'recoverable',
            details: error.message,
            fixCallback: () => fixMissingPackageJson(packageJsonPath),
          });
        } else {
          console.error(
            `Failed to load Jacly project at ${packageJsonPath}:`,
            error
          );
          if (!cancelled) {
            setJacProject(null);
            setJacRegistry(null);
            setPkg(null);
            setError({ reason: 'load-failed', seriousness: 'recoverable' });
          }
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [
    fs,
    projectPath,
    streamBusService,
    fixMissingPackageJson,
    setError,
    initPackageJson,
  ]);

  useEffect(() => {
    return () => {
      if (device) {
        device
          .destroy()
          .catch(err =>
            console.error('Failed to destroy device on unmount:', err)
          );
      }
    };
  }, [device]);

  const handleSetDevice = useCallback<JacDeviceActions['setDevice']>(
    async (newDevice, newConnectionType) => {
      setDevice(prev => {
        if (prev) {
          prev
            .destroy()
            .catch(err =>
              console.error('Failed to destroy previous device:', err)
            );
        }
        return newDevice;
      });
      setConnectionType(newConnectionType || null);
    },
    []
  );

  const reloadNodeModules = useCallback(
    () => setNodeModulesVersion(v => v + 1),
    []
  );

  const state = useMemo<JacDeviceState>(
    () => ({
      jacProject,
      jacRegistry,
      device,
      connectionType,
      pkg,
      nodeModulesVersion,
      connectionStatus,
      outStream: undefined,
      errStream: undefined,
    }),
    [
      jacProject,
      jacRegistry,
      device,
      connectionType,
      pkg,
      nodeModulesVersion,
      connectionStatus,
    ]
  );

  const actions = useMemo<JacDeviceActions>(
    () => ({
      setDevice: handleSetDevice,
      reloadNodeModules,
      setConnectionStatus,
    }),
    [handleSetDevice, reloadNodeModules, setConnectionStatus]
  );

  const contextValue = useMemo<JacDeviceContextValue>(
    () => ({
      state,
      actions,
      meta: {},
    }),
    [state, actions]
  );

  return (
    <JacDeviceContext.Provider value={contextValue}>
      {children}
    </JacDeviceContext.Provider>
  );
}
