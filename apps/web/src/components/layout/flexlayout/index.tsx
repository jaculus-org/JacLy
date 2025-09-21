import { useState, useEffect } from 'react';
import * as FlexLayout from 'flexlayout-react';
import './styles/flexlayout.css';

import { storage, STORAGE_KEYS } from '@/lib/storage';
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
import { IJsonRowNode, IJsonTabNode, IJsonTabSetNode } from 'flexlayout-react';
import { JacProject } from '@/lib/project/jacProject';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from '@tanstack/react-router';
import { FileExplorerPanel } from '@/panels/file-explorer';

type FlexContent = ReturnType<typeof useIntlayer<'flexlayout'>>;

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
          case 'file-explorer':
            tab.name = content.fileExplorerTab.value;
            break;
        }
      });
    });
  }
  if (json.layout) {
    updateTabset(json.layout, content);
  }
}

function updateTabset(
  node: IJsonRowNode | IJsonTabSetNode,
  content: FlexContent
) {
  if (node.children) {
    node.children.forEach(
      (child: IJsonTabNode | IJsonTabSetNode | IJsonRowNode) => {
        if (child.type === 'tab') {
          const tabChild = child as IJsonTabNode;
          if (tabChild.component === 'blockly') {
            tabChild.name = content.blocklyEditorTab.value;
          }
        } else if (child.type === 'tabset') {
          updateTabset(child as IJsonTabSetNode, content);
        }
      }
    );
  }
}

interface BlocksLayoutProps {
  project: JacProject;
}

function BlocksLayout({ project }: BlocksLayoutProps) {
  console.log('Rendering BlocksLayout for project:', project);
  const content = useIntlayer('flexlayout');
  const { modelRef } = useFlexLayout();

  // FlexLayout model configuration
  const defaultJson: FlexLayout.IJsonModel = {
    global: {
      tabEnableClose: false,
      tabEnableRename: false,
      tabSetEnableMaximize: true,
      tabSetEnableDrop: true,
      tabSetEnableDrag: true,
      tabSetEnableTabStrip: true,
    },
    borders: [
      {
        type: 'border',
        location: 'left',
        size: 250,
        selected: -1,
        children: [
          {
            type: 'tab',
            name: content.jaculusTab.value,
            component: 'jaculus',
            id: 'jaculus',
            enableClose: false,
          },
          {
            type: 'tab',
            name: content.fileExplorerTab.value,
            component: 'file-explorer',
            id: 'file-explorer',
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
      console.error('Error saving layout model:', _error);
    }
  };

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();
    const tabName = node.getName();
    const isInBorder = node.getParent() instanceof FlexLayout.BorderNode;

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
        return wrapComponent(<BlocklyEditorPanel />, isInBorder);
      case 'code':
        return wrapComponent(<GeneratedCodePanel />, isInBorder);
      case 'terminal':
        return wrapComponent(<TerminalPanel />, isInBorder);
      case 'jaculus':
        return wrapComponent(<JaculusPanel />, isInBorder);
      case 'file-explorer':
        return wrapComponent(<FileExplorerPanel />, isInBorder);
      default:
        return wrapComponent(
          <div>
            {content.unknownComponent.value.replace(
              '{component}',
              component ?? 'unknown'
            )}
          </div>,
          false
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

interface FlexLayoutEditorProps {
  project: JacProject | undefined;
}

export function FlexLayoutEditor({ project }: FlexLayoutEditorProps) {
  const content = useIntlayer('flexlayout');
  const navigate = useNavigate();

  if (!project) {
    enqueueSnackbar(content.projectNotFound.value, { variant: 'error' });
    navigate({ to: '/editor' });
    return null;
  }

  return (
    <FlexLayoutProvider>
      <BlocksLayout project={project} />
    </FlexLayoutProvider>
  );
}
