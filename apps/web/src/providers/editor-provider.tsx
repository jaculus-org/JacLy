import { createContext, useContext, useState } from 'react';
import * as FlexLayout from 'flexlayout-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { defaultJson } from '@/lib/editor/flex-layout/default';
import { PanelWrapper } from '@/components/editor/panels/wrapper';
import { BlocklyEditorPanel } from '@/components/editor/panels/blockly';
import TerminalPanel from '@/components/editor/panels/terminal';
import '@/components/editor/flex-layout/flexlayout.css';
import type { JaclyProject } from '@/lib/projects/project-manager';
import { FileExplorerPanel } from '@/components/editor/panels/file-explorer';
import { JaculusPanel } from '@/components/editor/panels/jaculus';
import { CodePanel } from '@/components/editor/panels/code';
import { GeneratedCodePanel } from '@/components/editor/panels/generated-code';
import { useJacProject } from '@/providers/jac-project-provider';
import { LoadingEditor } from '@/components/editor/loading';

type EditorProviderProps = {
  project: JaclyProject;
};

type EditorState = {
  sourceCode: string;
  setSourceCode: (code: string) => void;
  controlPanel: (type: PanelType, action: PanelAction) => void;
  addPanelSourceCode: (filePath: string) => void;
};

type PanelType =
  | 'blockly'
  | 'terminal'
  | 'jaculus'
  | 'file-explorer'
  | 'source-code'
  | 'generated-code';
type PanelAction = 'close' | 'expand' | 'collapse' | 'focus';

const initialState: EditorState = {
  sourceCode: '',
  setSourceCode: () => {},
  controlPanel: () => {},
  addPanelSourceCode: () => {},
};

const EditorContext = createContext<EditorState>(initialState);

export function EditorProvider({ project }: EditorProviderProps) {
  const { fsMounted } = useJacProject();
  const [model, setModel] = useState<FlexLayout.Model>(() => {
    return FlexLayout.Model.fromJson(
      storage.get<FlexLayout.IJsonModel>(STORAGE_KEYS.LAYOUT_MODEL, defaultJson)
    );
  });

  function handleModelChange(newModel: FlexLayout.Model) {
    setModel(newModel);
    try {
      const layoutJson = newModel.toJson();
      storage.set(STORAGE_KEYS.LAYOUT_MODEL, layoutJson, true);
    } catch (_error) {
      console.error('Error saving layout model:', _error);
    }
  }

  function getDefaultSize(type: PanelType): number {
    switch (type) {
      case 'jaculus':
        return 350;
      case 'terminal':
        return 400;
      case 'generated-code':
        return 400;
      case 'file-explorer':
        return 250;
      case 'source-code':
        return 300;
      default:
        return 300;
    }
  }

  function controlPanel(type: PanelType, action: PanelAction) {
    const node = model.getNodeById(type) as FlexLayout.TabNode;
    if (!node) return;

    switch (action) {
      case 'close':
        node.getParent()?.removeChild(node);
        break;
      case 'expand':
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));

        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(node.getId(), {
            size: getDefaultSize(type),
          })
        );
        break;
      case 'collapse':
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(node.getId(), {
            size: 0,
          })
        );
        break;
      case 'focus':
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));
        break;
    }
  }

  function addPanelSourceCode(filePath: string) {
    const panelId = `generated-code-${filePath}`;
    const existingNode = model.getNodeById(panelId) as FlexLayout.TabNode;

    if (existingNode) {
      // Panel already exists, just focus it
      model.doAction(FlexLayout.Actions.selectTab(panelId));
      return;
    }

    const tabset = model.getNodeById('main-tabset') as FlexLayout.TabSetNode;
    if (tabset) {
      const toNode = {
        type: 'tab',
        name: filePath.split('/').pop() || filePath,
        component: 'code',
        id: panelId,
        enableClose: true,
        config: { filePath: filePath },
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

  function factory(node: FlexLayout.TabNode) {
    const component = node.getComponent();
    const tabName = node.getName();
    const isInBorder = node.getParent() instanceof FlexLayout.BorderNode;
    const isHighlighted = false;

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
      case 'terminal':
        return wrapComponent(<TerminalPanel />, isInBorder, isHighlighted);
      case 'jaculus':
        return wrapComponent(
          <JaculusPanel project={project} />,
          isInBorder,
          isHighlighted
        );
      case 'file-explorer':
        return wrapComponent(
          <FileExplorerPanel project={project} />,
          isInBorder,
          isHighlighted
        );
      case 'code':
        return wrapComponent(
          <CodePanel filePath={config?.filePath} ifNotExists="create" />,
          isInBorder,
          isHighlighted
        );

      case 'generated-code':
        return wrapComponent(
          <GeneratedCodePanel project={project} />,
          isInBorder,
          isHighlighted
        );
      default:
        return wrapComponent(
          <div>Unknown component: {component}</div>,
          false,
          isHighlighted
        );
    }
  }

  const value: EditorState = {
    sourceCode: initialState.sourceCode,
    setSourceCode: (code: string) => {
      value.sourceCode = code;
    },
    controlPanel,
    addPanelSourceCode,
  };

  if (!fsMounted) {
    return <LoadingEditor />;
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
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within a EditorProvider');
  }
  return context;
}
