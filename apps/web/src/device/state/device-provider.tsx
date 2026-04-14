import path from 'node:path';
import type { JacDevice } from '@jaculus/device';
import { getRequest } from '@jaculus/jacly/project';
import { Project } from '@jaculus/project';
import {
  InvalidPackageJsonFormatError,
  loadPackageJson,
  type PackageJson,
} from '@jaculus/project/package';
import { Registry } from '@jaculus/project/registry';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useBuildInfo } from '@/core/hooks/use-build-info';
import { m } from '@/core/paraglide/messages';
import { logger } from '@/core/services/logger-service';
import { useActiveProject } from '@/project';
import { useKeyboardShortcut } from '@/project/hooks/use-keyboard-shortcut';
import { Route } from '@/routes/__root';
import { restart, uploadCode } from '../services/device-operations';
import type { ConnectionStatus, ConnectionType } from '../types/connection';
import {
  type JacDeviceActions,
  JacDeviceContext,
  type JacDeviceContextValue,
  type JacDeviceState,
} from './device-context';

interface JacDeviceProviderProps {
  children: ReactNode;
}

export function JacDeviceProvider({ children }: JacDeviceProviderProps) {
  const { streamBusService: _streamBusService } = Route.useRouteContext();
  const buildInfo = useBuildInfo();
  const { state: projectState, actions: projectActions } = useActiveProject();
  const { fs, projectPath } = projectState;
  const { setError } = projectActions;
  const [device, setDevice] = useState<JacDevice | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);

  const [jacProject, setJacProject] = useState<Project | null>(null);
  const [jacRegistry, setJacRegistry] = useState<Registry | null>(null);
  const [pkg, setPkg] = useState<PackageJson | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useKeyboardShortcut({ key: 'r', ctrl: true, meta: true, shift: false }, async () => {
    if (!device) return;
    await restart(device);
    enqueueSnackbar(m.jac_device_provider_restart(), { variant: 'success' });
  });

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
          'utf-8',
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
    [fs, setError],
  );

  const initPackageJson = useCallback(
    async (pkg: PackageJson) => {
      if (pkg.jaculus?.jaclyVersion && pkg.jaculus.jaclyVersion !== buildInfo.version) {
        enqueueSnackbar(m.jac_device_provider_outdated_package_json(), {
          variant: 'warning',
        });
      }
    },
    [buildInfo],
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
        setJacRegistry(new Registry(pkgJson.jaculus?.registry, getRequest, logger));

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
          console.error(`Failed to load Jacly project at ${packageJsonPath}:`, error);
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
  }, [fs, projectPath, fixMissingPackageJson, setError, initPackageJson]);

  useEffect(() => {
    return () => {
      if (device) {
        device.destroy().catch((err) => console.error('Failed to destroy device on unmount:', err));
      }
    };
  }, [device]);

  const handleSetDevice = useCallback<JacDeviceActions['setDevice']>(
    async (newDevice, newConnectionType) => {
      setDevice((prev) => {
        if (prev) {
          prev.destroy().catch((err) => console.error('Failed to destroy previous device:', err));
        }
        return newDevice;
      });
      setConnectionType(newConnectionType || null);
    },
    [],
  );

  const state = useMemo<JacDeviceState>(
    () => ({
      jacProject,
      jacRegistry,
      device,
      connectionType,
      pkg,
      connectionStatus,
      outStream: undefined,
      errStream: undefined,
    }),
    [jacProject, jacRegistry, device, connectionType, pkg, connectionStatus],
  );

  const actions = useMemo<JacDeviceActions>(
    () => ({
      setDevice: handleSetDevice,
      setConnectionStatus,
    }),
    [handleSetDevice],
  );

  const contextValue = useMemo<JacDeviceContextValue>(
    () => ({
      state,
      actions,
      meta: {},
    }),
    [state, actions],
  );

  return <JacDeviceContext.Provider value={contextValue}>{children}</JacDeviceContext.Provider>;
}
