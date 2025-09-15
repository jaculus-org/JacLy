import { storage, STORAGE_KEYS } from '@/utils/storage';
import { createContext, useContext, useEffect, useState } from 'react';

type JaclyProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

type JaclyProviderState = {
  setGeneratedCode: (code: string) => void;
  generatedCode: string;
};

const initialState: JaclyProviderState = {
  setGeneratedCode: () => null,
  generatedCode: '',
};

const JaclyProviderContext = createContext<JaclyProviderState>(initialState);

export function JaclyProvider({
  children,
  storageKey = STORAGE_KEYS.JACLY,
  ...props
}: JaclyProviderProps) {
  const [generatedCode, setGeneratedCode] = useState<string>(() => {
    return storage.get(storageKey, '');
  });

  useEffect(() => {
    storage.set(storageKey, generatedCode);
  }, [generatedCode, storageKey]);

  const value = {
    setGeneratedCode: (code: string) => {
      storage.set(storageKey, code);
      setGeneratedCode(code);
    },
    generatedCode,
  };

  return (
    <JaclyProviderContext.Provider {...props} value={value}>
      {children}
    </JaclyProviderContext.Provider>
  );
}

export const useJacly = () => {
  const context = useContext(JaclyProviderContext);

  if (context === undefined)
    throw new Error('useJacly must be used within a JaclyProvider');

  return context;
};
