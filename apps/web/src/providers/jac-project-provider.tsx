import { useWebFs } from '@/hooks/fs-hook';
import { createContext, useContext } from 'react';
// import { JacDevice } from '@jaculus/device';

type JacProjectProviderProps = {
  children: React.ReactNode;
  projectId: string;
};

type JacProjectState = {
  readonly projectId: string;
  // device: JacDevice | null;
  // setDevice: (device: JacDevice | null) => void;
};

const initialState: JacProjectState = {
  projectId: '',
  // device: null,
  // setDevice: () => {},
};

const JacProjectContext = createContext<JacProjectState>(initialState);

export function JacProjectProvider({
  children,
  projectId,
}: JacProjectProviderProps) {
  useWebFs(projectId);
  // const [device, setDevice] = useState<JacDevice | null>(null);

  const value = {
    projectId,
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
