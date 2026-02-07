import { createContext, use, useMemo, useState, type ReactNode } from 'react';
import { loadPackageJsonSync, Project, Registry } from '@jaculus/project';
import { JacDevice } from '@jaculus/device';
import { getRequest } from '@jaculus/jacly/project';
import { Writable } from 'node:stream';
import path from 'path';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { createWritableStream } from '@/features/terminal/lib/stream';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import { enqueueSnackbar } from 'notistack';
import type { ConnectionType } from '../types/connection';

export interface JacDeviceContextValue {
  jacProject: Project | null;
  device: JacDevice | null;
  setDevice: (device: JacDevice | null, connectionType?: ConnectionType) => void;
  connectionType: ConnectionType | null;
  outStream?: Writable;
  errStream?: Writable;
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
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);

  const jacProject = useMemo(() => {
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      if (!fs.existsSync(packageJsonPath)) {
        enqueueSnackbar(
          'No package.json found in the project. Please initialize a Jacly project.',
          { variant: 'warning' }
        );
        return null;
      }
      const pkg = loadPackageJsonSync(fs, packageJsonPath);
      const registry = new Registry(pkg.registry, getRequest);

      return new Project(
        fs,
        projectPath,
        createWritableStream('runtime-stdout', addEntry),
        createWritableStream('runtime-stderr', addEntry),
        registry
      );
    } catch (error) {
      console.error(
        `Failed to load Jacly project at ${packageJsonPath}:`,
        error
      );
      enqueueSnackbar(
        `Failed to load Jacly project. Please ensure it is a valid Jacly project.`,
        { variant: 'error' }
      );
      return null;
    }
  }, [fs, projectPath, addEntry]);

  const contextValue: JacDeviceContextValue = {
    jacProject,
    device,
    setDevice: (newDevice: JacDevice | null, connectionType?: ConnectionType) => {
      if (device) {
        device.destroy();
      }
      setDevice(newDevice);
      setConnectionType(connectionType || null);
    },
    connectionType,
  };

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
