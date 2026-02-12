import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadPackageJsonSync,
  Project,
  Registry,
  type PackageJson,
} from '@jaculus/project';
import { JacDevice } from '@jaculus/device';
import { getRequest } from '@jaculus/jacly/project';
import { Writable } from 'node:stream';
import path from 'path';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { createWritableStream } from '@/features/terminal/lib/stream';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import { enqueueSnackbar } from 'notistack';
import type { ConnectionStatus, ConnectionType } from '../types/connection';
import { useKeyboardShortcut } from '@/features/project/hooks/use-keyboard-shortcut';
import { m } from '@/paraglide/messages';
import { restart, uploadCode } from '../lib/device';

export interface JacDeviceContextValue {
  jacProject: Project | null;
  device: JacDevice | null;
  setDevice: (
    device: JacDevice | null,
    connectionType?: ConnectionType
  ) => Promise<void>;
  connectionType: ConnectionType | null;
  outStream?: Writable;
  errStream?: Writable;
  pkg: PackageJson | null;

  // version counter that increments when node_modules changes
  nodeModulesVersion: number;
  reloadNodeModules: () => void;

  // Device initialization state
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const JacDeviceContext = createContext<JacDeviceContextValue | null>(
  null
);

interface JacDeviceProviderProps {
  children: ReactNode;
}

export function JacDeviceProvider({ children }: JacDeviceProviderProps) {
  const { fs, projectPath } = useActiveProject();
  const { addEntry } = useTerminal();
  const [device, setDevice] = useState<JacDevice | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    null
  );

  const [jacProject, setJacProject] = useState<Project | null>(null);
  const [pkg, setPkg] = useState<PackageJson | null>(null);
  const [loadError, setLoadError] = useState<
    'missing-package-json' | 'load-failed' | null
  >(null);
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

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      const packageJsonPath = path.join(projectPath, 'package.json');
      try {
        if (!fs.existsSync(packageJsonPath)) {
          if (!cancelled) {
            setJacProject(null);
            setPkg(null);
            setLoadError('missing-package-json');
          }
          return;
        }
        const pkgJson = loadPackageJsonSync(fs, packageJsonPath);
        const registry = await Registry.create(pkgJson.registry, getRequest);

        if (!cancelled) {
          setJacProject(
            new Project(
              fs,
              projectPath,
              createWritableStream('runtime-stdout', addEntry),
              createWritableStream('runtime-stderr', addEntry),
              registry
            )
          );
          setPkg(pkgJson);
          setLoadError(null);
        }
      } catch (error) {
        console.error(
          `Failed to load Jacly project at ${packageJsonPath}:`,
          error
        );
        if (!cancelled) {
          setJacProject(null);
          setPkg(null);
          setLoadError('load-failed');
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [fs, projectPath, addEntry]);

  // Show notifications in useEffect (after render) rather than during render
  useEffect(() => {
    if (loadError === 'missing-package-json') {
      enqueueSnackbar(
        'No package.json found in the project. Please initialize a Jacly project.',
        { variant: 'warning' }
      );
    } else if (loadError === 'load-failed') {
      enqueueSnackbar(
        'Failed to load Jacly project. Please ensure it is a valid Jacly project.',
        { variant: 'error' }
      );
    }
  }, [loadError]);

  // Cleanup device on provider unmount
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

  const handleSetDevice = useCallback(
    async (newDevice: JacDevice | null, connectionType?: ConnectionType) => {
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
      setConnectionType(connectionType || null);
    },
    []
  );

  const reloadNodeModules = useCallback(
    () => setNodeModulesVersion(v => v + 1),
    []
  );

  const contextValue = useMemo<JacDeviceContextValue>(
    () => ({
      jacProject,
      device,
      setDevice: handleSetDevice,
      connectionType,
      pkg,
      nodeModulesVersion,
      reloadNodeModules,
      connectionStatus,
      setConnectionStatus,
    }),
    [
      jacProject,
      device,
      handleSetDevice,
      connectionType,
      pkg,
      nodeModulesVersion,
      reloadNodeModules,
      connectionStatus,
      setConnectionStatus,
    ]
  );

  return (
    <JacDeviceContext.Provider value={contextValue}>
      {children}
    </JacDeviceContext.Provider>
  );
}

export function useJacDevice() {
  const context = use(JacDeviceContext);
  if (!context) {
    throw new Error('useJacDevice must be used within a JacDeviceProvider');
  }
  return context;
}
