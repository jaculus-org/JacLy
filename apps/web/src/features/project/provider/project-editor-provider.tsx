import { m } from '@/paraglide/messages';
import { createContext, use, useState, useEffect, useCallback } from 'react';
import * as FlexLayout from 'flexlayout-react';
import { Route } from '@/routes/__root';
import { ProjectLoadingIndicator } from '@/features/project/components/project-loading';
import '@/features/project/components/flex-layout/flexlayout.css';
import { flexLayoutDefaultJson, getPanelTitle } from '@/features/project/lib/flexlayout-defaults';
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
import { factory } from '@/features/project/lib/flexlayout-components';
import { ProjectEditorHeader } from '../components/project-editor-header';

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
  const { settingsService } = Route.useRouteContext();
  const [model, setModel] = useState<FlexLayout.Model | null>(null);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const settings = await settingsService.getSettings();
        const savedLayout = settings.flexLayoutModel;
        setModel(FlexLayout.Model.fromJson(getUpdatedLayoutModel(savedLayout)));
      } catch (error) {
        console.error('Failed to load layout settings:', error);
        enqueueSnackbar('Failed to load layout settings, using default.', {
          variant: 'info',
        });
        setModel(FlexLayout.Model.fromJson(flexLayoutDefaultJson));
      }
    };

    loadLayout();
  }, [settingsService]);

  async function handleModelChange(newModel: FlexLayout.Model) {
    setModel(newModel);
    try {
      await settingsService.setSettings('flexLayoutModel', newModel.toJson());
    } catch (_error) {
      console.error('Error saving layout model:', _error);
    }
  }

  // callback to translate panel names at render time
  const onRenderTab = useCallback(
    (
      node: FlexLayout.TabNode,
      renderValues: { leading: React.ReactNode; content: React.ReactNode; buttons: React.ReactNode[] }
    ) => {
      const component = node.getComponent() as PanelType | undefined;
      const translatedName = getPanelTitle(component);
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
