import { createContext, use, useState, type ReactNode } from 'react';
import { loadPackageJsonSync, Project, Registry } from '@jaculus/project';
import { JacDevice } from '@jaculus/device';
import { getRequest } from '@jaculus/jacly/project';
import { Writable } from 'node:stream';
import path from 'path';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { createWritableStream } from '@/features/terminal/lib/stream';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';

export interface JacDeviceContextValue {
  jacProject: Project;
  device: JacDevice | null;
  setDevice: (device: JacDevice | null) => void;
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

  const pkg = loadPackageJsonSync(fs, path.join(projectPath, 'package.json'));
  const registry = new Registry(pkg.registry, getRequest);

  const jacProject = new Project(
    fs,
    projectPath,
    createWritableStream('runtime-stdout', addEntry),
    createWritableStream('runtime-stderr', addEntry),
    registry
  );

  const contextValue: JacDeviceContextValue = {
    jacProject: jacProject,
    device: device,
    setDevice: (newDevice: JacDevice | null) => {
      if (device) {
        device.destroy();
      }
      setDevice(newDevice);
    },
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
