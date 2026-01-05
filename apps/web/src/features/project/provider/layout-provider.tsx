import { createContext, use, useState, useEffect } from 'react';
import * as FlexLayout from 'flexlayout-react';
import { Route } from '@/routes/__root';
import { EditorMountLoading } from '@/features/project/components/editor-loading';
import '@/features/project/components/flex-layout/flexlayout.css';
import { flexLayoutDefaultJson } from '@/features/project/lib/flexlayout-defaults';
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

export interface EditorContextValue {
  controlPanel: (type: PanelType, action: PanelAction) => void;
  openPanel: {
    (type: 'source-code', props?: NewPanelProps['source-code']): void;
  };
}

const initialState: EditorContextValue = {
  controlPanel: () => {},
  openPanel: () => {},
};

export const EditorContext = createContext<EditorContextValue>(initialState);

export function EditorProvider() {
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
          variant: 'error',
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

  const value: EditorContextValue = {
    controlPanel: controlPanel.bind(null, model!),
    openPanel: openPanel.bind(null, model!),
  };

  if (!model) {
    return <EditorMountLoading message="Loading layout..." />;
  }

  return (
    <EditorContext.Provider value={value}>
      <div className="h-[calc(100vh-3.5rem)] w-full">
        <FlexLayout.Layout
          model={model}
          factory={factory}
          onModelChange={handleModelChange}
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
