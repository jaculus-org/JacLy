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
import { type ReactNode, useEffect, useState } from 'react';
import { logger } from '@/core';
import { useBuildInfo } from '@/core/hooks/use-build-info';
import { m } from '@/core/paraglide/messages';
import { jaclySaveCoordinator } from '@/editor';
import { useActiveProject, useKeyboardShortcut } from '@/project';
import {
  type JacDeviceActions,
  JacDeviceContext,
  type JacDeviceContextValue,
  type JacDeviceState,
} from './device-context';
import { restart, uploadCode } from './services/device-operations';
import type { ConnectionStatus, ConnectionType } from './types/connection';

interface JacDeviceProviderProps {
  children: ReactNode;
}

export function JacDeviceProvider({ children }: JacDeviceProviderProps) {
  const buildInfo = useBuildInfo();
  const { state: projectState, actions: projectActions } = useActiveProject();
  const { fs, projectPath } = projectState;
  const { setError } = projectActions;
  const [device, setDevice] = useState<JacDevice | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);

  const [jacProject, setJacProject] = useState<Project | null>(null);
  const [jacRegistry, setJacRegistry] = useState<Registry | null>(null);
  const [pkg, setPkg] = useState<PackageJson | null>(null);
  const [packageJsonError, setPackageJsonError] = useState<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useKeyboardShortcut({ key: 'r', ctrl: true, meta: true, shift: false }, async () => {
    if (!device) return;
    await restart(device);
    enqueueSnackbar(m.jac_device_provider_restart(), { variant: 'success' });
  });

  useKeyboardShortcut({ key: 'u', ctrl: true, meta: true }, async () => {
    if (!device) return;
    await jaclySaveCoordinator.flushPendingWrites();
    await uploadCode(await jacProject!.getFlashFiles(), device);
    enqueueSnackbar(m.jac_device_provider_upload_code(), {
      variant: 'success',
    });
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      const packageJsonPath = path.join(projectPath, 'package.json');

      async function fixMissingPackageJson() {
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
      }

      try {
        if (!fs.existsSync(packageJsonPath)) {
          if (!cancelled) {
            setJacProject(null);
            setPkg(null);
            setPackageJsonError(null);
            setError({
              reason: 'missing-package-json',
              seriousness: 'recoverable',
              fixCallback: fixMissingPackageJson,
            });
          }
          return;
        }
        const pkgJson = await loadPackageJson(fs, packageJsonPath);
        if (pkgJson.jaculus?.jaclyVersion && pkgJson.jaculus.jaclyVersion !== buildInfo.version) {
          enqueueSnackbar(m.jac_device_provider_outdated_package_json(), {
            variant: 'warning',
          });
        }

        if (!cancelled) {
          setJacRegistry(new Registry(pkgJson.jaculus?.registry, getRequest, logger));
          setJacProject(new Project(fs, projectPath, logger));
          setPkg(pkgJson);
          setPackageJsonError(null);
        }
      } catch (error) {
        if (error instanceof InvalidPackageJsonFormatError) {
          console.error('Invalid package.json format:', error.message);
          if (!cancelled) {
            setJacProject(null);
            setJacRegistry(null);
            setPkg(null);
            setPackageJsonError(error.message);
          }
        } else {
          console.error('Error loading project:', error);
          if (!cancelled) {
            setJacProject(null);
            setJacRegistry(null);
            setPkg(null);
            setPackageJsonError(null);
            setError({ reason: 'load-failed', seriousness: 'recoverable' });
          }
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [buildInfo.version, fs, projectPath, setError]);

  useEffect(() => {
    return () => {
      if (device) {
        device.destroy().catch((err) => console.error('Failed to destroy device on unmount:', err));
      }
    };
  }, [device]);

  const handleSetDevice: JacDeviceActions['setDevice'] = async (newDevice, newConnectionType) => {
    setDevice((prev) => {
      if (prev) {
        prev.destroy().catch((err) => console.error('Failed to destroy previous device:', err));
      }
      return newDevice;
    });
    setConnectionType(newConnectionType || null);
  };

  const state: JacDeviceState = {
    jacProject,
    jacRegistry,
    device,
    connectionType,
    pkg,
    connectionStatus,
    outStream: undefined,
    errStream: undefined,
    packageJsonError,
  };

  const actions: JacDeviceActions = {
    setDevice: handleSetDevice,
    setConnectionStatus,
  };

  const contextValue: JacDeviceContextValue = {
    state,
    actions,
    meta: {},
  };

  return <JacDeviceContext.Provider value={contextValue}>{children}</JacDeviceContext.Provider>;
}
