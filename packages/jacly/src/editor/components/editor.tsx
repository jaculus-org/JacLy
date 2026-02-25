import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { Theme } from '@/editor/types/theme';
import { useState, useEffect, useRef } from 'react';
import { getBlocklyTheme } from '@/editor/lib/theme';
import { JaclyBlocksData } from '@jaculus/project';
import {
  loadToolboxConfiguration,
  registerDocsCallbacks,
} from '@/blocks/lib/toolbox-loader';
import { registerWorkspaceChangeListener } from '@/blocks/lib/rules';
import { JaclyLoading } from './loading';

import '../styles/toolbox.css';

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
import '../../blocks/new-blocks/promiseAll';
import '../../blocks/new-blocks/loops';
import '../../blocks/new-blocks/angle';
import '../../blocks/new-blocks/slider';
import '../../blocks/new-blocks/procedures';
import { registerConstCategoryCallback } from '../../blocks/new-blocks/typed-variables/constants';
import { registerVariableCategoryCallback } from '../../blocks/new-blocks/typed-variables/variables';

registerJaclyCustomCategory();
interface JaclyEditorProps {
  jaclyBlocksData: JaclyBlocksData;
  theme: Theme;
  locale: string;
  initialJson: object;
  onJsonChange: (workspaceJson: object) => void;
  onGeneratedCode: (code: string) => void;
}

export function JaclyEditor({
  jaclyBlocksData,
  theme,
  locale,
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
      console.log('Messages loaded');
    })();
  }, [locale]);

  useEffect(() => {
    if (blocklyMessagesLoaded) {
      setToolboxConfiguration(loadToolboxConfiguration(jaclyBlocksData));
      console.log('Toolbox configuration loaded');
    }
  }, [jaclyBlocksData, blocklyMessagesLoaded]);

  if (!toolboxConfiguration || !blocklyMessagesLoaded) {
    return <JaclyLoading />;
  }

  const handleWorkspaceChange = (workspace: WorkspaceSvgExtended) => {
    if (!listenerRegistrationStatus.current) {
      registerWorkspaceChangeListener(workspace);

      registerCrossTabCopyPaste();
      registerFieldColour();
      registerDocsCallbacks(workspace);
      registerVariableCategoryCallback(workspace);
      registerConstCategoryCallback(workspace);
      workspace.addChangeListener(shadowBlockConversionChangeListener);

      listenerRegistrationStatus.current = true;
    }

    onGeneratedCode(generateCodeFromWorkspace(workspace));
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
