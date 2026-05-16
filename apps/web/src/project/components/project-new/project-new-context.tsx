import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { createContext, useContext } from 'react';

export interface ProjectNewState {
  projectName: string;
  projectType: JaculusProjectType;
  templates: RegistryListTemplate[];
  selectedTemplate: RegistryListTemplate | null;
  registers: string[];
  templatesLoading: boolean;
  templatesError: boolean;
  isCreating: boolean;
}

export interface ProjectNewActions {
  setProjectName: (name: string) => void;
  setRegisters: (registers: string[]) => void;
  selectType: (type: JaculusProjectType) => void;
  selectTemplate: (templateId: string) => void;
  createProject: () => Promise<void>;
}

export interface ProjectNewMeta {
  showInitialTemplateLoading: boolean;
  showTemplateRefresh: boolean;
  canSubmit: boolean;
}

export interface ProjectNewContextValue {
  state: ProjectNewState;
  actions: ProjectNewActions;
  meta: ProjectNewMeta;
}

export const ProjectNewContext = createContext<ProjectNewContextValue | undefined>(undefined);

export function useProjectNew() {
  const ctx = useContext(ProjectNewContext);
  if (!ctx) {
    throw new Error('ProjectNew.* components must be within ProjectNew.Provider');
  }
  return ctx;
}
