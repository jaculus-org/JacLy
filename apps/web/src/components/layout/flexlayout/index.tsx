import { useState, useEffect } from 'react';
import * as FlexLayout from 'flexlayout-react';
import './styles/flexlayout.css';

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
import { useIntlayer } from 'react-intlayer';

// Helper function to update layout JSON with translated names

// type FlexContent = {
//   jaculusTab: { value: string };
//   generatedCodeTab: { value: string };
//   terminalTab: { value: string };
//   blocklyEditorTab: { value: string };
//   unknownComponent: { value: string };
// };

type FlexContent = {
  jaculusTab: { value: string };
  generatedCodeTab: { value: string };
  terminalTab: { value: string };
  blocklyEditorTab: { value: string };
  unknownComponent: { value: string };
};

function updateLayoutJson(json: FlexLayout.IJsonModel, content: FlexContent) {
  if (json.borders) {
    json.borders.forEach(border => {
      border.children.forEach(tab => {
        switch (tab.component) {
          case 'jaculus':
            tab.name = content.jaculusTab.value;
            break;
          case 'code':
            tab.name = content.generatedCodeTab.value;
            break;
          case 'terminal':
            tab.name = content.terminalTab.value;
            break;
        }
      });
    });
  }
  if (json.layout) {
    updateTabset(json.layout, content);
  }
}

type TabNode = {
  type?: string;
  component?: string;
  name?: string;
  children?: TabNode[];
};

function updateTabset(node: TabNode, content: FlexContent) {
  if (node.children) {
    node.children.forEach((child: TabNode) => {
      if (child.type === 'tab') {
        if (child.component === 'blockly') {
          child.name = content.blocklyEditorTab.value;
        }
      } else if (child.type === 'tabset') {
        updateTabset(child, content);
      }
    });
  }
}

function BlocksLayout() {
  const content = useIntlayer('flexlayout');
  const { modelRef } = useFlexLayout();

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
            name: content.jaculusTab.value,
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
            name: content.generatedCodeTab.value,
            component: 'code',
            id: 'code',
            enableClose: false,
          },
          {
            type: 'tab',
            name: content.terminalTab.value,
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
              name: content.blocklyEditorTab.value,
              component: 'blockly',
              id: 'blockly',
              enableClose: false,
            },
          ],
        },
      ],
    },
  };

  const [model, setModel] = useState<FlexLayout.Model>(() => {
    return FlexLayout.Model.fromJson(
      storage.get<FlexLayout.IJsonModel>(STORAGE_KEYS.LAYOUT_MODEL, defaultJson)
    );
  });

  // Update model names when content changes
  useEffect(() => {
    setModel(prevModel => {
      const json = prevModel.toJson();
      updateLayoutJson(json, content);
      return FlexLayout.Model.fromJson(json);
    });
  }, [content]);

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
        return wrapComponent(
          <div>
            {content.unknownComponent.value.replace(
              '{component}',
              component ?? 'unknown'
            )}
          </div>
        );
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

export function FlexLayoutEditor() {
  return (
    <FlexLayoutProvider>
      <BlocksLayout />
    </FlexLayoutProvider>
  );
}
