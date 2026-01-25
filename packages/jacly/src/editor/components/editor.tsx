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

import { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import { generateCodeFromWorkspace } from '../lib/code-generation';

// Extensions
import '@blockly/toolbox-search';
import '@blockly/block-plus-minus';
import '@blockly/field-colour-hsv-sliders';
import { registerFieldColour } from '@blockly/field-colour';
import { registerCrossTabCopyPaste } from '../plugins/cross-tab-copy-paste';
import { shadowBlockConversionChangeListener } from '@blockly/shadow-block-converter';
import { registerJaclyCustomCategory } from '../lib/custom-category';

import '../../blocks/new-blocks/color';
import '../../blocks/new-blocks/parallel';
import '../../blocks/new-blocks/loops';
import '../../blocks/new-blocks/angle';
import '../../blocks/new-blocks/slider';
import '../../blocks/new-blocks/procedures';

registerJaclyCustomCategory();

interface JaclyEditorProps {
  theme: Theme;
  jaclyBlockFiles: JaclyBlocksFiles;
  locale: string;
  jaclyTranslations?: Record<string, string>;
  initialJson: any;
  onJsonChange: (workspaceJson: object) => void;
  onGeneratedCode: (code: string) => void;
}

export function JaclyEditor({
  theme,
  jaclyBlockFiles,
  locale,
  jaclyTranslations,
  initialJson,
  onJsonChange,
  onGeneratedCode: onGeneratedCode,
}: JaclyEditorProps) {
  const [toolboxConfiguration, setToolboxConfiguration] =
    useState<Blockly.utils.toolbox.ToolboxDefinition | null>(null);
  const [blocklyMessagesLoaded, setBlocklyMessagesLoaded] = useState(false);
  const listenerRegistrationStatus = useRef(false);

  // load Blockly messages based on locale
  useEffect(() => {
    (async () => {
      try {
        let messages;
        if (locale === 'cs') {
          messages = await import('blockly/msg/cs');
        } else {
          // default to English
          messages = await import('blockly/msg/en');
        }

        Object.assign(Blockly.Msg, messages.default || messages);
        setBlocklyMessagesLoaded(true);
      } catch (error) {
        console.error('Failed to load Blockly messages:', error);
        // fallback to English if loading fails
        const enMessages = await import('blockly/msg/en');
        Object.assign(Blockly.Msg, enMessages.default || enMessages);
        setBlocklyMessagesLoaded(true);
      }
    })();
  }, [locale]);

  useEffect(() => {
    if (blocklyMessagesLoaded) {
      setToolboxConfiguration(
        loadToolboxConfiguration(jaclyBlockFiles, jaclyTranslations)
      );
    }
  }, [jaclyBlockFiles, jaclyTranslations, blocklyMessagesLoaded]);

  if (!toolboxConfiguration || !blocklyMessagesLoaded) {
    return <JaclyLoading />;
  }

  const handleWorkspaceChange = (workspace: WorkspaceSvgExtended) => {
    if (!listenerRegistrationStatus.current) {
      registerWorkspaceChangeListener(workspace as any);

      registerCrossTabCopyPaste();
      registerFieldColour();
      workspace.addChangeListener(shadowBlockConversionChangeListener);

      listenerRegistrationStatus.current = true;
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
          scaleSpeed: 1.1,
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
