import { createContext, useContext, useState } from 'react';

type EditorProviderProps = {
  children: React.ReactNode;
};

type EditorState = {
  sourceCode: string;
  setSourceCode: (code: string) => void;
};

const initialState: EditorState = {
  sourceCode: '',
  setSourceCode: () => {},
};

const EditorContext = createContext<EditorState>(initialState);

export function EditorProvider({ children }: EditorProviderProps) {
  const [state] = useState<EditorState>(initialState);

  return (
    <EditorContext.Provider value={state}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within a EditorProvider');
  }
  return context;
}
