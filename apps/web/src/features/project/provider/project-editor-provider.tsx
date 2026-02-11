import { createContext, use, useState, useEffect, useCallback } from 'react';
import * as FlexLayout from 'flexlayout-react';
import { Route } from '@/routes/__root';
import { ProjectLoadingIndicator } from '@/features/project/components/project-loading';
import '@/features/project/components/flex-layout/flexlayout.css';
import {
  flexLayoutDefaultJson,
  getPanelTitle,
} from '@/features/project/lib/flexlayout-defaults';
import {
  controlPanel,
  getUpdatedLayoutModel,
  openPanel,
} from '@/features/project/lib/flexlayout';
import type {
  NewPanelProps,
  PanelAction,
  PanelType,
} from '@/features/project/types/flexlayout-type';
import { enqueueSnackbar } from 'notistack';
import { m } from '@/paraglide/messages';
import { factory } from '@/features/project/lib/flexlayout-components';
import { ProjectEditorHeader } from '../components/project-editor-header';
import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
import { useActiveProject } from './active-project-provider';
import { useKeyboardShortcut } from '../hooks/use-keyboard-shortcut';

export interface EditorContextValue {
  controlPanel: (type: PanelType, action: PanelAction) => void;
  openPanel: {
    (type: 'code', props?: NewPanelProps['code']): void;
  };
}

const initialState: EditorContextValue = {
  controlPanel: () => {},
  openPanel: () => {},
};

export const EditorContext = createContext<EditorContextValue>(initialState);

export function ProjectEditorProvider() {
  const { projectManService } = Route.useRouteContext();
  const { pkg } = useJacDevice();
  const { dbProject } = useActiveProject();
  const [model, setModel] = useState<FlexLayout.Model | null>(null);

  useKeyboardShortcut({ key: 'p', ctrl: true, meta: true }, async () => {
    controlPanel(model!, 'packages', 'toggle');
  });

  useKeyboardShortcut({ key: 'e', ctrl: true, meta: true }, async () => {
    controlPanel(model!, 'file-explorer', 'toggle');
  });

  useKeyboardShortcut({ key: 'l', ctrl: true, meta: true }, async () => {
    controlPanel(model!, 'logs', 'toggle');
  });

  useKeyboardShortcut({ key: 's', ctrl: true, meta: true }, async () => {
    controlPanel(model!, 'console', 'toggle');
  });

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const savedLayout = (await projectManService.getProject(dbProject.id))
          ?.layout;
        setModel(FlexLayout.Model.fromJson(getUpdatedLayoutModel(savedLayout)));
      } catch (error) {
        console.error('Failed to load layout settings:', error);
        enqueueSnackbar(m.project_layout_load_error(), {
          variant: 'info',
        });
        setModel(FlexLayout.Model.fromJson(flexLayoutDefaultJson));
      }
    };

    loadLayout();
  }, [projectManService, dbProject.id]);

  useEffect(() => {
    if (!model || !pkg?.jaculus) return;

    if (pkg.jaculus.projectType !== 'jacly') {
      console.log('Opening Code setup');
      controlPanel(model, 'blockly', 'close');
      openPanel(model, 'code', { filePath: 'src/index.ts' });
    }
  }, [model, pkg?.jaculus]);

  async function handleModelChange(newModel: FlexLayout.Model) {
    setModel(newModel);

    try {
      await projectManService.updateProjectKey(
        dbProject.id,
        'layout',
        newModel.toJson()
      );
    } catch (_error) {
      console.error('Error saving layout model:', _error);
    }
  }

  // callback to translate panel names at render time
  const onRenderTab = useCallback(
    (
      node: FlexLayout.TabNode,
      renderValues: {
        leading: React.ReactNode;
        content: React.ReactNode;
        buttons: React.ReactNode[];
      }
    ) => {
      const translatedName = getPanelTitle(node);
      if (translatedName) {
        renderValues.content = translatedName;
      }
    },
    []
  );

  const value: EditorContextValue = {
    controlPanel: controlPanel.bind(null, model!),
    openPanel: openPanel.bind(null, model!),
  };

  if (!model) {
    return <ProjectLoadingIndicator message="Loading layout..." />;
  }

  return (
    <EditorContext.Provider value={value}>
      <ProjectEditorHeader />
      <div className="h-[calc(100vh-3.5rem)] w-full">
        <FlexLayout.Layout
          model={model}
          factory={factory}
          onModelChange={handleModelChange}
          onRenderTab={onRenderTab}
        />
      </div>
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = use(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within a EditorProvider');
  }
  return context;
}
