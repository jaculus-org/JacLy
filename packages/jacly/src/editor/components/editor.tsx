import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import 'blockly/blocks';
import { useCallback, useMemo, useRef } from 'react';

// Types
import { Theme } from '@/editor/types/theme';
import { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import { JaclyBlocksData } from '@jaculus/project';

// Lib
import { getBlocklyTheme } from '@/editor/lib/theme';
import { generateCodeFromWorkspace } from '../lib/code-generation';
import { registerJaclyCustomCategory } from '../lib/custom-category';

// Hooks
import { useBlocklyMessages } from '../hooks/use-blockly-messages';

// Blocks
import {
  loadToolboxConfiguration,
  registerDocsCallbacks,
} from '@/blocks/lib/toolbox';
import { registerWorkspaceChangeListener } from '@/blocks/lib/workspace';
import '@/blocks/new-blocks';

// Utils
import { debounce } from '@/utils/debouncer';

// Components
import { JaclyLoading } from './loading';

// Styles
import '../styles/toolbox.css';

// Extensions
import { registerFieldColour } from '@blockly/field-colour';
import { registerCrossTabCopyPaste } from '../plugins/cross-tab-copy-paste';

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
  onGeneratedCode,
}: JaclyEditorProps) {
  const messagesLoaded = useBlocklyMessages(locale);

  const listenerRegistered = useRef(false);

  const debouncedGenerate = useMemo(
    () =>
      debounce((workspace: WorkspaceSvgExtended) => {
        onGeneratedCode(generateCodeFromWorkspace(workspace));
      }, 300),
    [onGeneratedCode]
  );
  const debouncedJsonChange = useMemo(
    () =>
      debounce((json: object) => {
        onJsonChange(json);
      }, 300),
    [onJsonChange]
  );

  const toolboxConfiguration = useMemo(
    () => (messagesLoaded ? loadToolboxConfiguration(jaclyBlocksData) : null),
    [jaclyBlocksData, messagesLoaded]
  );

  const handleWorkspaceChange = useCallback(
    (workspace: WorkspaceSvgExtended) => {
      if (!listenerRegistered.current) {
        registerWorkspaceChangeListener(workspace);
        registerCrossTabCopyPaste();
        registerFieldColour();
        registerDocsCallbacks(workspace);
        // registerVariableCategoryCallback(workspace);
        listenerRegistered.current = true;
      }

      debouncedGenerate(workspace);
    },
    [debouncedGenerate]
  );

  if (!messagesLoaded || !toolboxConfiguration) {
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
      onJsonChange={debouncedJsonChange}
    />
  );
}
