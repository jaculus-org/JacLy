import { createContext, useContext } from 'react';
import type { JaclyBlocksData } from '@jaculus/project';
import type { JaclyEngine } from '@jaculus/jacly/engine';

export interface EditorJaclyState {
  initialJson: object | null;
  jaclyBlocksData: JaclyBlocksData | null;
  engine: JaclyEngine;
}

export interface EditorJaclyActions {
  handleJsonChange: (json: object) => void;
  handleGeneratedCode: (code: string) => void;
  flushSave: () => Promise<void>;
}

export interface EditorJaclyContextValue {
  state: EditorJaclyState;
  actions: EditorJaclyActions;
}

export const EditorJaclyContext = createContext<
  EditorJaclyContextValue | undefined
>(undefined);

export function useEditorJacly() {
  const ctx = useContext(EditorJaclyContext);
  if (!ctx)
    throw new Error('EditorJacly.* must be used within EditorJacly.Provider');
  return ctx;
}
