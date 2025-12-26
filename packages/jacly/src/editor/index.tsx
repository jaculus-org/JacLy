import { useCallback, useEffect, useRef, useState } from 'react';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import { BlocklyWorkspace } from '@kuband/react-blockly';
import * as Blockly from 'blockly/core';
import { darkTheme, lightTheme, Theme } from './theme';
import { WorkspaceSvg } from 'blockly';
import { JaclyBlocks } from '@/blocks';
import { LoadingEditor } from './loading';
import { applyBlockRules, setupShadowReplacementListener } from './blockRules';
import './shortcuts';

interface EditorProps {
  theme: Theme;
  jaclyBlocks: JaclyBlocks;
}

function generateCodeWithImports(
  workspace: WorkspaceSvg,
  jaclyBlocks: JaclyBlocks
): string {
  let code = javascriptGenerator.workspaceToCode(workspace);
  const allBlocks = workspace.getAllBlocks(false);
  const blockTypes = allBlocks.map(block => block.type);
  const imports = jaclyBlocks.getImportsForBlocks(blockTypes);
  if (imports.length > 0) {
    code = imports.join('\n') + '\n\n' + code;
  }
  return code;
}

export function JaclyEditor({ theme, jaclyBlocks }: EditorProps) {
  const [toolboxConfiguration, setToolboxConfiguration] =
    useState<Blockly.utils.toolbox.ToolboxDefinition | null>(null);

  useEffect(() => {
    async function loadToolbox() {
      const loadedLibs = new Set<string>();
      const config = await jaclyBlocks.loadLibs(loadedLibs);
      setToolboxConfiguration(config);
    }

    loadToolbox();
  }, [jaclyBlocks]);

  // prevent recursive application of block rules
  const isApplyingBlockRulesRef = useRef(false);
  const shadowListenerSetUpRef = useRef(false);

  const enforceEntryBlockRules = useCallback((workspace: WorkspaceSvg) => {
    isApplyingBlockRulesRef.current = true;
    try {
      applyBlockRules(workspace);
    } finally {
      isApplyingBlockRulesRef.current = false;
    }
  }, []);

  const onWorkspaceChange = useCallback(
    async (workspace: WorkspaceSvg) => {
      if (isApplyingBlockRulesRef.current) {
        return;
      }

      if (!shadowListenerSetUpRef.current) {
        setupShadowReplacementListener(workspace);
        shadowListenerSetUpRef.current = true;
      }

      enforceEntryBlockRules(workspace);
      jaclyBlocks.saveJaclyProject(
        Blockly.serialization.workspaces.save(workspace)
      );

      const code = generateCodeWithImports(workspace, jaclyBlocks);
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
      initialJson={jaclyBlocks.loadJaclyProject()}
      className="h-full w-full"
      onWorkspaceChange={onWorkspaceChange}
      onJsonChange={onJsonChange}
    />
  );
}

export { LoadingEditor } from './loading';
