import { createContext, useContext } from 'react';
import type * as fs from 'fs';
import type { IDbProject } from '@/types/project';
import { JaclyFiles } from '../types/jacly-files';

export type ProjectErrorReason =
  | 'fs-mount-failed'
  | 'missing-package-json'
  | 'invalid-package-json'
  | 'load-failed'
  | 'unknown-error';

export interface ProjectError {
  reason: ProjectErrorReason;
  details?: string;
  seriousness: 'unrecoverable' | 'recoverable';
  fixCallback?: () => void;
}

export interface ActiveProjectState {
  fs: typeof fs;
  fsp: typeof fs.promises;
  dbProject: IDbProject;
  projectPath: string;
  error: ProjectError | null;
}

export interface ActiveProjectActions {
  setError: (error: ProjectError | null) => void;
  getFileName: (fileType: keyof typeof JaclyFiles) => string;
}

export interface ActiveProjectMeta {
  projectId: string;
}

export interface ActiveProjectContextValue {
  state: ActiveProjectState;
  actions: ActiveProjectActions;
  meta: ActiveProjectMeta;
}

export const ActiveProjectContext = createContext<
  ActiveProjectContextValue | undefined
>(undefined);

export function useActiveProject(): ActiveProjectContextValue {
  const context = useContext(ActiveProjectContext);
  if (!context) {
    throw new Error(
      'useActiveProject must be used within an ActiveProject.Provider'
    );
  }
  return context;
}
