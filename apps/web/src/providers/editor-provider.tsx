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

type EditorProviderProps = {
  project: JaclyProject;
};

type EditorState = {
  sourceCode: string;
  setSourceCode: (code: string) => void;
};

const initialState: EditorState = {
  sourceCode: '',
  setSourceCode: () => {},
};

const EditorContext = createContext<EditorState>(initialState);

export function EditorProvider({ project }: EditorProviderProps) {
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

  const factory = (node: FlexLayout.TabNode) => {
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

    // const config = node.getConfig();
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
          <FileExplorerPanel project={project} onFileSelect={() => {}} />,
          isInBorder,
          isHighlighted
        );
      case 'generated-code':
        return wrapComponent(
          // <GeneratedCodePanel
          //   code={config?.code}
          //   filePath={config?.filePath}
          //   editable={true}
          //   live={config?.live}
          // />,
          <>
            <div>Generated Code Panel Placeholder</div>
          </>,
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
  };

  const value: EditorState = {
    sourceCode: initialState.sourceCode,
    setSourceCode: (code: string) => {
      value.sourceCode = code;
    },
  };

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
