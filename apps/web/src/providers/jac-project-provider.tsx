import { useWebFs } from '@/hooks/fs-hook';
import type { JaclyProject } from '@/lib/projects/project-manager';
import { createContext, useContext } from 'react';
// import { JacDevice } from '@jaculus/device';

type JacProjectProviderProps = {
  children: React.ReactNode;
  project: JaclyProject;
};

type JacProjectState = {
  readonly project: JaclyProject;
  // device: JacDevice | null;
  // setDevice: (device: JacDevice | null) => void;
};

const initialState: JacProjectState = {
  project: {} as JaclyProject,
  // device: null,
  // setDevice: () => {},
};

const JacProjectContext = createContext<JacProjectState>(initialState);

export function JacProjectProvider({
  children,
  project,
}: JacProjectProviderProps) {
  useWebFs(project.id);
  // const [device, setDevice] = useState<JacDevice | null>(null);

  const value = {
    project,
    // device,
    // setDevice: (newDevice: JacDevice | null) => {
    //   if (newDevice) {
    //     newDevice.destroy();
    //   }
    //   setDevice(newDevice);
    // }
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
