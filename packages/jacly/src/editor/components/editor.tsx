import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import * as Blockly from 'blockly/core';
import { Theme } from '@/editor/types/theme';
import { useState, useEffect } from 'react';
import { getBlocklyTheme } from '@/editor/lib/theme';
import { JaclyBlocksFiles } from '@jaculus/project';
import { loadToolboxConfiguration } from '@/editor/lib/toolbox-loader';
import { workspaceChange } from '../lib/workspace-change';
import { JaclyLoading } from './loading';

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

  useEffect(() => {
    (async () => {
      setToolboxConfiguration(loadToolboxConfiguration(jaclyBlockFiles));
    })();
  }, [jaclyBlockFiles]);

  if (!toolboxConfiguration) {
    return <JaclyLoading />;
  }

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
      onWorkspaceChange={workspaceChange.bind(null, onGeneratedCode)}
      onJsonChange={onJsonChange}
    />
  );
}
