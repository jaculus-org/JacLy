import { useWebFs } from '@/hooks/fs-hook';
import type { JaclyProject } from '@/lib/projects/project-manager';
import { createContext, useContext, useState, useMemo } from 'react';
import { JacDevice } from '@jaculus/device';
import { Project } from '@jaculus/project';
import { fs } from '@zenfs/core';
import type { FSInterface } from '@jaculus/project/fs';
import type { Writable } from 'node:stream';
import { useTerminal } from '@/hooks/terminal-store';
import { createStdoutStream, createStderrStream } from '@/lib/streams';

type JacProjectProviderProps = {
  children: React.ReactNode;
  project: JaclyProject;
};

type JacProjectState = {
  readonly project: JaclyProject;
  readonly projectInstance: Project;
  readonly out: Writable;
  readonly err: Writable;
  device: JacDevice | null;
  setDevice: (device: JacDevice | null) => void;
};

const initialState: JacProjectState = {
  project: {} as JaclyProject,
  projectInstance: {} as Project,
  out: {} as Writable,
  err: {} as Writable,
  device: null,
  setDevice: () => {},
};

const JacProjectContext = createContext<JacProjectState>(initialState);

export function JacProjectProvider({
  children,
  project,
}: JacProjectProviderProps) {
  useWebFs(project.id);
  const [device, setDevice] = useState<JacDevice | null>(null);
  const terminal = useTerminal();

  // Create streams that output to terminal
  const {
    out,
    err,
    project: projectInstance,
  } = useMemo(() => {
    const outStream = createStdoutStream(terminal.addEntry);
    const errStream = createStderrStream(terminal.addEntry);

    const projectInstance = new Project(
      fs as unknown as FSInterface,
      `/${project.id}`,
      outStream,
      errStream
    );

    return {
      out: outStream,
      err: errStream,
      project: projectInstance,
    };
  }, [project.id, terminal.addEntry]);

  const value: JacProjectState = {
    project,
    projectInstance,
    out,
    err,
    device,
    setDevice: (newDevice: JacDevice | null) => {
      if (device) {
        device.destroy();
      }
      setDevice(newDevice);
    },
  };

  return (
    <JacProjectContext.Provider value={value}>
      {children}
    </JacProjectContext.Provider>
  );
}

export function useJacProject() {
  const context = useContext(JacProjectContext);
  if (context === undefined) {
    throw new Error('useJacProject must be used within a JacProjectProvider');
  }
  return context;
}
