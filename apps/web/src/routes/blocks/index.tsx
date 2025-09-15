import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import * as FlexLayout from 'flexlayout-react';
import '../../components/flexlayout/styles/flexlayout.css';

import { storage, STORAGE_KEYS } from '@/utils/storage';
import { Terminal } from '@/panels/Terminal';
import { BlocklyEditor } from '@/panels/BlocklyEditor';
import { GeneratedCode } from '@/panels/GeneratedCode';

export const Route = createFileRoute('/blocks/')({
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

function Blocks() {
  const [model, setModel] = useState<FlexLayout.Model>(() => {
    return FlexLayout.Model.fromJson(
      storage.get<FlexLayout.IJsonModel>(STORAGE_KEYS.LAYOUT_MODEL, defaultJson)
    );
  });

  // Save layout changes to localStorage
  const handleModelChange = (newModel: FlexLayout.Model) => {
    setModel(newModel);
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

    switch (component) {
      case 'blockly':
        return <BlocklyEditor />;
      case 'code':
        return <GeneratedCode />;
      case 'terminal':
        return <Terminal />;
      default:
        return <div>Unknown component: {component}</div>;
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
