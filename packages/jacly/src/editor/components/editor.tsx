import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { Theme } from '@/editor/types/theme';
import { useState, useEffect, useRef } from 'react';
import { getBlocklyTheme } from '@/editor/lib/theme';
import { JaclyBlocksFiles } from '@jaculus/project';
import { loadToolboxConfiguration } from '@/blocks/lib/toolbox-loader';
import { registerWorkspaceChangeListener } from '@/blocks/lib/rules';
import { JaclyLoading } from './loading';
import * as En from 'blockly/msg/en';
import { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import { generateCodeFromWorkspace } from '../lib/code-generation';

Object.assign(Blockly.Msg, En);

interface JaclyEditorProps {
  theme: Theme;
  jaclyBlockFiles: JaclyBlocksFiles;
  initialJson: any;
  onJsonChange: (workspaceJson: object) => void;
  onGeneratedCode: (code: string) => void;
}

export function JaclyEditor({
  theme,
  jaclyBlockFiles,
  initialJson,
  onJsonChange,
  onGeneratedCode: onGeneratedCode,
}: JaclyEditorProps) {
  const [toolboxConfiguration, setToolboxConfiguration] =
    useState<Blockly.utils.toolbox.ToolboxDefinition | null>(null);
  const isListenerRegistered = useRef(false);

  useEffect(() => {
    (async () => {
      setToolboxConfiguration(loadToolboxConfiguration(jaclyBlockFiles));
    })();
  }, [jaclyBlockFiles]);

  if (!toolboxConfiguration) {
    return <JaclyLoading />;
  }

  const handleWorkspaceChange = (workspace: WorkspaceSvgExtended) => {
    if (!isListenerRegistered.current) {
      registerWorkspaceChangeListener(workspace as any);
      isListenerRegistered.current = true;
    }
    onGeneratedCode(generateCodeFromWorkspace(workspace));
    Blockly.Events.BLOCK_MOVE;
  };

  return (
    <BlocklyWorkspace
      key={theme}
      toolboxConfiguration={toolboxConfiguration}
      workspaceConfiguration={{
        theme: getBlocklyTheme(theme),
        renderer: 'zelos',
        trashcan: true,
        comments: true,
        sounds: false,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.9,
          maxScale: 3,
          minScale: 0.2,
          scaleSpeed: 1.3,
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
      }}
      initialJson={initialJson}
      className="h-full w-full"
      onWorkspaceChange={handleWorkspaceChange}
      onJsonChange={onJsonChange}
    />
  );
}
