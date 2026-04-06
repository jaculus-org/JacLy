import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import 'blockly/blocks';
import { useCallback, useMemo } from 'react';

import { Theme } from '@/editor/types/theme';
import { WorkspaceSvgExtended } from '@/core/types/custom-block';
import { JaclyBlocksData } from '@jaculus/project';
import { getBlocklyTheme } from '@/editor/lib/theme';
import { useBlocklyMessages } from '../hooks/use-blockly-messages';
import { JaclyEngine } from '@/engine/engine';
import { debounce } from '@/utils/debouncer';
import { JaclyLoading } from './loading';
import '../styles/toolbox.css';

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

  const engine = useMemo(() => new JaclyEngine(), []);

  const toolboxConfiguration = useMemo(
    () => (messagesLoaded ? engine.buildToolbox(jaclyBlocksData) : null),
    [jaclyBlocksData, messagesLoaded, engine]
  );

  const blocksKey = useMemo(
    () => JSON.stringify(jaclyBlocksData),
    [jaclyBlocksData]
  );

  const debouncedGenerate = useMemo(
    () =>
      debounce((workspace: WorkspaceSvgExtended) => {
        onGeneratedCode(engine.generateCode(workspace));
      }, 300),
    [engine, onGeneratedCode]
  );

  const debouncedJsonChange = useMemo(
    () =>
      debounce((json: object) => {
        onJsonChange(json);
      }, 300),
    [onJsonChange]
  );

  const handleWorkspaceChange = useCallback(
    (workspace: WorkspaceSvgExtended) => {
      engine.attachToWorkspace(workspace);
      debouncedGenerate(workspace);
    },
    [engine, debouncedGenerate]
  );

  if (!messagesLoaded || !toolboxConfiguration) {
    return <JaclyLoading />;
  }

  return (
    <BlocklyWorkspace
      key={`${theme}-${blocksKey}`}
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
