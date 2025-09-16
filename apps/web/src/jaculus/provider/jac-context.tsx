import { storage, STORAGE_KEYS } from '@/utils/storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { JacDevice } from '@jaculus/device';
import { JacProject } from '@/lib/project/project';

type JacProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

type JacProviderState = {
  device: JacDevice | null;
  setDevice: (device: JacDevice | null) => void;

  project: JacProject | null;
  setProject: (project: JacProject | null) => void;

  setGeneratedCode: (code: string) => void;
  generatedCode: string;
};

const initialState: JacProviderState = {
  setGeneratedCode: () => null,
  generatedCode: '',
  device: null,
  project: null,
  setDevice: () => null,
  setProject: () => null,
};

const JacProviderContext = createContext<JacProviderState>(initialState);

export function JacProvider({
  children,
  storageKey = STORAGE_KEYS.JACLY,
  ...props
}: JacProviderProps) {
  const [generatedCode, setGeneratedCode] = useState<string>(
    storage.get(storageKey, '')
  );
  const [device, setDevice] = useState<JacDevice | null>(null);
  const [project, setProject] = useState<JacProject | null>(null);

  useEffect(() => {
    storage.set(storageKey, generatedCode);
  }, [generatedCode, storageKey]);

  const value = {
    device,
    setDevice: (newDevice: JacDevice | null) => {
      if (device !== null) {
        device.destroy();
      }
      setDevice(newDevice);
    },

    project,
    setProject,

    setGeneratedCode: (code: string) => {
      storage.set(storageKey, code);
      setGeneratedCode(code);
    },
    generatedCode,
  };

  return (
    <JacProviderContext.Provider {...props} value={value}>
      {children}
    </JacProviderContext.Provider>
  );
}

export const useJac = () => {
  const context = useContext(JacProviderContext);

  if (context === undefined)
    throw new Error('useJac must be used within a JacProvider');

  return context;
};
