import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type RefObject,
} from 'react';
import * as FlexLayout from 'flexlayout-react';
import { useIntlayer } from 'react-intlayer';
import {
  type IJsonRowNode,
  type IJsonTabNode,
  type IJsonTabSetNode,
} from 'flexlayout-react';
import { type JacProject } from '@/lib/project/jacProject';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { GeneratedCodePanel } from '@/panels/generated-code';
import { JaculusPanel } from '@/panels/jaculus';
import { PanelWrapper } from '@/panels/wrapper';
import { BlocklyEditorPanel } from '@/panels/blockly-editor';
import { TerminalPanel } from '@/panels/terminal';
import { FileExplorerPanel } from '@/panels/file-explorer';
import './styles/flexlayout.css';
import { CodePanelFs } from '@/panels/fs-code';

type FlexLayoutContent = ReturnType<typeof useIntlayer<'flexlayout'>>;

type PanelType = 'jaculus' | 'terminal' | 'code' | 'file-explorer';

type PanelAction = 'show' | 'hide' | 'toggle';

interface FlexLayoutContextType {
  modelRef: RefObject<FlexLayout.Model | null>;
  resetLayout: () => void;
  controlPanel: (type: PanelType, action: PanelAction) => void;
  addGeneratedCodeTab: (tabName: string, code: string) => void;
  addCodeTab: (fileName: string) => void;
  highlightTab: (tabId: string) => void;
}

const FlexLayoutContext = createContext<FlexLayoutContextType | undefined>(
  undefined
);

interface FlexLayoutInstantiationProps {
  project: JacProject;
  layout?: IJsonRowNode;
}

function updateLayoutJson(
  json: FlexLayout.IJsonModel,
  content: FlexLayoutContent
) {
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
  content: FlexLayoutContent
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

export function FlexLayoutInstantiation({
  project,
  layout,
}: FlexLayoutInstantiationProps) {
  console.log(project);
  const content = useIntlayer('flexlayout');

  // Default layout configuration
  const defaultLayout: IJsonRowNode = {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 100,
        id: 'main-tabset',
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
  };

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
    layout: layout ?? defaultLayout,
  };

  const modelRef = useRef<FlexLayout.Model | null>(null);
  const counterRef = useRef(0);

  const [model, setModel] = useState<FlexLayout.Model>(() => {
    return FlexLayout.Model.fromJson(
      storage.get<FlexLayout.IJsonModel>(STORAGE_KEYS.LAYOUT_MODEL, defaultJson)
    );
  });

  const [highlightedTabs, setHighlightedTabs] = useState<Set<string>>(
    new Set()
  );

  // Update model names when content changes
  useEffect(() => {
    setModel(prevModel => {
      const json = prevModel.toJson();
      updateLayoutJson(json, content);
      const newModel = FlexLayout.Model.fromJson(json);
      modelRef.current = newModel;
      return newModel;
    });
  }, [content]);

  // Update the model reference when model changes
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Save layout changes to localStorage
  const handleModelChange = (newModel: FlexLayout.Model) => {
    setModel(newModel);
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
    const isHighlighted = highlightedTabs.has(node.getId());

    const wrapComponent = (
      children: React.ReactNode,
      showName: boolean = false,
      highlight: boolean = false
    ) => (
      <PanelWrapper
        name={tabName && showName ? tabName : undefined}
        highlight={highlight}
      >
        {children}
      </PanelWrapper>
    );

    const config = node.getConfig();
    switch (component) {
      case 'blockly':
        return wrapComponent(<BlocklyEditorPanel />, isInBorder, isHighlighted);
      case 'code':
        return wrapComponent(
          <CodePanelFs
            code={config?.code}
            filePath={config?.filePath}
            editable={true}
            live={config?.live}
          />,
          isInBorder,
          isHighlighted
        );
      case 'terminal':
        return wrapComponent(<TerminalPanel />, isInBorder, isHighlighted);
      case 'jaculus':
        return wrapComponent(<JaculusPanel />, isInBorder, isHighlighted);
      case 'file-explorer':
        return wrapComponent(<FileExplorerPanel />, isInBorder, isHighlighted);
      case 'generated-code':
        return wrapComponent(
          <GeneratedCodePanel
            code={config?.code}
            filePath={config?.filePath}
            editable={true}
            live={config?.live}
          />,
          isInBorder,
          isHighlighted
        );
      default:
        return wrapComponent(
          <div>
            {content.unknownComponent.value.replace(
              '{component}',
              component ?? 'unknown'
            )}
          </div>,
          false,
          isHighlighted
        );
    }
  };

  function resetLayout(jsonOverride?: FlexLayout.IJsonModel) {
    const newModel = jsonOverride
      ? FlexLayout.Model.fromJson(jsonOverride)
      : FlexLayout.Model.fromJson(defaultJson);
    setModel(newModel);
  }

  const controlPanel = (type: PanelType, action: PanelAction) => {
    if (!modelRef.current) return;

    const getPanelId = (type: PanelType): string => {
      switch (type) {
        case 'jaculus':
          return 'jaculus';
        case 'terminal':
          return 'terminal';
        case 'code':
          return 'code';
        case 'file-explorer':
          return 'file-explorer';
        default:
          return '';
      }
    };

    const getDefaultSize = (type: PanelType): number => {
      switch (type) {
        case 'jaculus':
          return 350;
        case 'terminal':
          return 400;
        case 'code':
          return 400;
        case 'file-explorer':
          return 250;
        default:
          return 300;
      }
    };

    const panelId = getPanelId(type);
    if (!panelId) return;

    const node = modelRef.current.getNodeById(panelId);
    if (!node) return;

    const borderNode = node.getParent();
    if (!(borderNode && borderNode.getType() === 'border')) return;

    if (action === 'show') {
      // First select the tab to make it active
      modelRef.current.doAction(FlexLayout.Actions.selectTab(panelId));

      // Then ensure the border is visible
      modelRef.current.doAction(
        FlexLayout.Actions.updateNodeAttributes(borderNode.getId(), {
          size: getDefaultSize(type),
        })
      );
    } else if (action === 'hide') {
      modelRef.current.doAction(
        FlexLayout.Actions.updateNodeAttributes(borderNode.getId(), {
          size: 0,
        })
      );
    } else if (action === 'toggle') {
      const currentSize = borderNode.getRect().width;
      if (currentSize > 0) {
        controlPanel(type, 'hide');
      } else {
        controlPanel(type, 'show');
      }
    }
  };

  const addGeneratedCodeTab = (tabName: string, code: string) => {
    if (model) {
      const tabset = model.getNodeById('main-tabset') as FlexLayout.TabSetNode;
      if (tabset) {
        const toNode = {
          type: 'tab',
          name: tabName,
          component: 'generated-code',
          id: `generated-code-${counterRef.current++}`,
          enableClose: true,
          config: { code },
        };
        model.doAction(
          FlexLayout.Actions.addNode(
            toNode,
            tabset.getId(),
            FlexLayout.DockLocation.CENTER,
            -1
          )
        );
      }
    }
  };

  const addCodeTab = (fileName: string) => {
    if (model) {
      const tabset = model.getNodeById('main-tabset') as FlexLayout.TabSetNode;
      if (tabset) {
        const toNode = {
          type: 'tab',
          name: fileName.split('/').pop() || fileName,
          component: 'code',
          id: `generated-code-live-${counterRef.current++}`,
          enableClose: true,
          config: { filePath: fileName, live: true },
        };
        model.doAction(
          FlexLayout.Actions.addNode(
            toNode,
            tabset.getId(),
            FlexLayout.DockLocation.CENTER,
            -1
          )
        );
        // Highlight the new tab
        // setTimeout(() => highlightTab(toNode.id), 100);
        highlightTab(toNode.id);
      }
    }
  };

  const highlightTab = (tabId: string) => {
    setHighlightedTabs(prev => new Set(prev).add(tabId));
    setTimeout(() => {
      setHighlightedTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
      });
    }, 800);
  };

  const value: FlexLayoutContextType = {
    modelRef,
    resetLayout,
    controlPanel,
    addGeneratedCodeTab,
    addCodeTab,
    highlightTab,
  };

  return (
    <FlexLayoutContext.Provider value={value}>
      <div className="h-[calc(100vh-3.5rem)] w-full">
        <FlexLayout.Layout
          model={model}
          factory={factory}
          onModelChange={handleModelChange}
        />
      </div>
    </FlexLayoutContext.Provider>
  );
}

export function useFlexLayout() {
  const context = useContext(FlexLayoutContext);
  if (context === undefined) {
    throw new Error('useFlexLayout must be used within a FlexLayoutProvider');
  }
  return context;
}
