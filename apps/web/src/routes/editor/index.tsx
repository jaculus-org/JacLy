import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import * as FlexLayout from 'flexlayout-react';
import '../../components/layout/flexlayout/styles/flexlayout.css';

import { storage, STORAGE_KEYS } from '@/utils/storage';
import { GeneratedCodePanel } from '@/panels/generated-code';
import { JaculusPanel } from '@/panels/jaculus';
import {
  FlexLayoutProvider,
  useFlexLayout,
} from '@/providers/flexlayout-provider';
import { PanelWrapper } from '@/panels/wrapper';
import { BlocklyEditorPanel } from '@/panels/blockly-editor';
import { TerminalPanel } from '@/panels/terminal';

export const Route = createFileRoute('/editor/')({
  component: Blocks,
});

// FlexLayout model configuration
const defaultJson: FlexLayout.IJsonModel = {
  global: {
    // Remove close buttons from all tabs
    tabEnableClose: false,
    tabEnableRename: false,
    // Other global settings
    tabSetEnableMaximize: true,
    tabSetEnableDrop: true,
    tabSetEnableDrag: true,
    tabSetEnableTabStrip: true,
  },
  borders: [
    {
      type: 'border',
      location: 'left',
      size: 0, // Hidden by default
      selected: 0,
      children: [
        {
          type: 'tab',
          name: 'Jaculus',
          component: 'jaculus',
          id: 'jaculus',
          enableClose: false,
        },
      ],
    },
    {
      type: 'border',
      location: 'right',
      size: 400,
      selected: 0,
      children: [
        {
          type: 'tab',
          name: 'Generated Code',
          component: 'code',
          id: 'code',
          enableClose: false,
        },
        {
          type: 'tab',
          name: 'Terminal',
          component: 'terminal',
          id: 'terminal',
          enableClose: false,
        },
      ],
    },
  ],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 100,
        children: [
          {
            type: 'tab',
            name: 'Blockly Editor',
            component: 'blockly',
            id: 'blockly',
            enableClose: false,
          },
        ],
      },
    ],
  },
};

function BlocksLayout() {
  const { modelRef } = useFlexLayout();
  const [model, setModel] = useState<FlexLayout.Model>(() => {
    return FlexLayout.Model.fromJson(
      storage.get<FlexLayout.IJsonModel>(STORAGE_KEYS.LAYOUT_MODEL, defaultJson)
    );
  });

  // Update the model reference when model changes
  useEffect(() => {
    modelRef.current = model;
  }, [model, modelRef]);

  // Save layout changes to localStorage
  const handleModelChange = (newModel: FlexLayout.Model) => {
    setModel(newModel);
    modelRef.current = newModel;
    try {
      const layoutJson = newModel.toJson();
      storage.set(STORAGE_KEYS.LAYOUT_MODEL, layoutJson, true);
    } catch (_error) {
      // Handle error if needed
      console.error('Error saving layout model:', _error);
    }
  };

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();
    const tabName = node.getName();

    const wrapComponent = (
      children: React.ReactNode,
      showName: boolean = false
    ) => (
      <PanelWrapper name={tabName && showName ? tabName : undefined}>
        {children}
      </PanelWrapper>
    );

    switch (component) {
      case 'blockly':
        return wrapComponent(<BlocklyEditorPanel />);
      case 'code':
        return wrapComponent(<GeneratedCodePanel />, true);
      case 'terminal':
        return wrapComponent(<TerminalPanel />, true);
      case 'jaculus':
        return wrapComponent(<JaculusPanel />, true);
      default:
        return wrapComponent(<div>Unknown component: {component}</div>);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <FlexLayout.Layout
        model={model}
        factory={factory}
        onModelChange={handleModelChange}
      />
    </div>
  );
}

function Blocks() {
  return (
    <FlexLayoutProvider>
      <BlocksLayout />
    </FlexLayoutProvider>
  );
}
