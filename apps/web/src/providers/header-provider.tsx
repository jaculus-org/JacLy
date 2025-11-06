import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type HeaderContextType = {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  const value: HeaderContextType = {
    actions,
    setActions,
  };

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
}

export function useHeaderActions() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeaderActions must be used within HeaderProvider');
  }
  return context;
}
