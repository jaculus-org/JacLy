import { createContext, useContext, type ReactNode } from 'react';
import type * as FlexLayout from 'flexlayout-react';
import type {
  NewPanelProps,
  PanelAction,
  PanelType,
} from '@/features/project/types/flexlayout-type';

export interface ProjectEditorState {
  model: FlexLayout.Model;
}

export interface ProjectEditorActions {
  controlPanel: (type: PanelType, action: PanelAction) => void;
  openPanel: {
    (type: 'code', props: NewPanelProps['code']): void;
    (type: 'error', props: NewPanelProps['error']): void;
  };
  handleModelChange: (newModel: FlexLayout.Model) => Promise<void> | void;
}

export interface ProjectEditorMeta {
  onRenderTab: (
    node: FlexLayout.TabNode,
    renderValues: {
      leading: ReactNode;
      content: ReactNode;
      buttons: ReactNode[];
    }
  ) => void;
}

export interface ProjectEditorContextValue {
  state: ProjectEditorState;
  actions: ProjectEditorActions;
  meta: ProjectEditorMeta;
}

export const ProjectEditorContext = createContext<
  ProjectEditorContextValue | undefined
>(undefined);

export function useProjectEditor(): ProjectEditorContextValue {
  const context = useContext(ProjectEditorContext);
  if (!context) {
    throw new Error(
      'useProjectEditor must be used within a ProjectEditor.Provider'
    );
  }
  return context;
}
