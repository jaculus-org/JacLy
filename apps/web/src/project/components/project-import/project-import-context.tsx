import { createContext, useContext } from 'react';

export interface ProjectImportState {
  projectName: string;
  selectedFile: File | null;
  packageUrl: string;
  activeTab: 'file' | 'url';
  isImporting: boolean;
  dragOver: boolean;
}

export interface ProjectImportActions {
  setProjectName: (name: string) => void;
  setSelectedFile: (file: File | null) => void;
  setPackageUrl: (url: string) => void;
  setActiveTab: (tab: 'file' | 'url') => void;
  setDragOver: (dragOver: boolean) => void;
  handleImport: () => Promise<void>;
}

export interface ProjectImportContextValue {
  state: ProjectImportState;
  actions: ProjectImportActions;
}

export const ProjectImportContext = createContext<ProjectImportContextValue | undefined>(undefined);

export function useProjectImport() {
  const ctx = useContext(ProjectImportContext);
  if (!ctx) throw new Error('ProjectImport.* must be used within ProjectImport.Provider');
  return ctx;
}
