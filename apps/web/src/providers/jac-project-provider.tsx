import { createContext, useContext, useState } from 'react';

type JacProjectProviderProps = {
  children: React.ReactNode;
};

type JacProjectState = {
	sourceCode: string;
	setSourceCode: (code: string) => void;
};

const initialState: JacProjectState = {
  sourceCode: '',
  setSourceCode: () => {},
};

const JacProjectContext = createContext<JacProjectState>(initialState);

export function JacProjectProvider(
	  { children }: JacProjectProviderProps,
) {
  const [state, setState] = useState<JacProjectState>(initialState);

  return (
    <JacProjectContext.Provider value={state}>
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
