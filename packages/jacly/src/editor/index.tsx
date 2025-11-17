import { useCallback, useEffect, useRef, useState } from 'react';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import { BlocklyWorkspace } from '@kuband/react-blockly';
import * as Blockly from 'blockly/core';
import { darkTheme, lightTheme, Theme } from './theme';
import { WorkspaceSvg } from 'blockly';
import { JaclyBlocks } from '@/blocks';
import { LoadingEditor } from './loading';
import { applyBlockRules } from './blockRules';

interface EditorProps {
  theme: Theme;
  jaclyBlocks: JaclyBlocks;
}

export function JaclyEditor({ theme, jaclyBlocks }: EditorProps) {
  const [toolboxConfiguration, setToolboxConfiguration] =
    useState<Blockly.utils.toolbox.ToolboxDefinition | null>(null);

  // prevent recursive application of block rules
  const isApplyingBlockRulesRef = useRef(false);

  const enforceEntryBlockRules = useCallback((workspace: WorkspaceSvg) => {
    isApplyingBlockRulesRef.current = true;
    try {
      applyBlockRules(workspace);
    } finally {
      isApplyingBlockRulesRef.current = false;
    }
  }, []);

  useEffect(() => {
    async function loadToolbox() {
      const config = await jaclyBlocks.loadLibs();
      setToolboxConfiguration(config);
    }

    loadToolbox();
  }, [jaclyBlocks]);

  const onWorkspaceChange = useCallback(
    async (workspace: WorkspaceSvg) => {
      if (isApplyingBlockRulesRef.current) {
        return;
      }

      enforceEntryBlockRules(workspace);
      jaclyBlocks.saveJaclyProject(
        Blockly.serialization.workspaces.save(workspace)
      );
      const code = javascriptGenerator.workspaceToCode(workspace);
      console.log('Generated code:', code);
      jaclyBlocks.saveGeneratedCode(code);
    },
    [enforceEntryBlockRules, jaclyBlocks]
  );

  const onJsonChange = useCallback(
    async (newJson: object) => {
      jaclyBlocks.saveJaclyProject(newJson);
    },
    [jaclyBlocks]
  );

  if (!toolboxConfiguration) {
    return <LoadingEditor />;
  }

  return (
    <BlocklyWorkspace
      key={theme}
      toolboxConfiguration={toolboxConfiguration}
      workspaceConfiguration={{
        theme: theme === 'dark' ? darkTheme : lightTheme,
        renderer: 'zelos',
        trashcan: true,
        comments: true,
        sounds: false,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
      }}
      initialJson={jaclyBlocks.loadJaclyProject()}
      className="h-full w-full"
      onWorkspaceChange={onWorkspaceChange}
      onJsonChange={onJsonChange}
    />
  );
}

export { LoadingEditor } from './loading';
