import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import 'blockly/blocks';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Theme } from '@/editor/types/theme';
import { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import { JaclyBlocksData } from '@jaculus/project';
import { getBlocklyTheme } from '@/editor/theme/theme';
import { useBlocklyMessages } from '../hooks/use-blockly-messages';
import { JaclyEngine } from '@/engine/engine';
import type { EngineMissingPackages } from '@/workspace/validation/types';
import { debounce } from '@/utils/debouncer';
import { JaclyLoading } from './loading';
import {
  attachBlocklyEditorWorkspace,
  detachBlocklyEditorWorkspace,
  registerBlocklyEditorIntegrations,
} from '@/editor/integrations/blockly-editor-adapter';
import '../styles/toolbox.css';

interface JaclyEditorProps {
  engine: JaclyEngine;
  jaclyBlocksData: JaclyBlocksData;
  theme: Theme;
  locale: string;
  initialJson: object;
  onJsonChange: (workspaceJson: object) => void;
  onGeneratedCode: (code: string) => void;
  onMissingPackage: (missingPackages: EngineMissingPackages) => Promise<void>;
}

export function JaclyEditor({
  engine,
  jaclyBlocksData,
  theme,
  locale,
  initialJson,
  onJsonChange,
  onGeneratedCode,
  onMissingPackage,
}: JaclyEditorProps) {
  registerBlocklyEditorIntegrations();
  const messagesLoaded = useBlocklyMessages(locale);

  const toolboxConfiguration = useMemo(
    () => (messagesLoaded ? engine.buildToolbox(jaclyBlocksData) : null),
    [jaclyBlocksData, messagesLoaded, engine]
  );

  const [sanitizedJson, setSanitizedJson] = useState<object | null>(null);

  useEffect(() => {
    if (!toolboxConfiguration) return;
    let cancelled = false;
    const task = onMissingPackage
      ? engine.validateWorkspace(initialJson, onMissingPackage)
      : Promise.resolve({
          state: initialJson,
          restoredTypes: [] as string[],
          replacedTypes: [] as string[],
        });
    task.then(result => {
      if (!cancelled) setSanitizedJson(result.state);
    });
    return () => {
      cancelled = true;
    };
  }, [initialJson, engine, onMissingPackage, toolboxConfiguration]);

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
      attachBlocklyEditorWorkspace(workspace);
      debouncedGenerate(workspace);
    },
    [engine, debouncedGenerate]
  );

  const handleWorkspaceDispose = useCallback(
    (workspace: WorkspaceSvgExtended) => {
      detachBlocklyEditorWorkspace(workspace);
      engine.detachFromWorkspace(workspace);
    },
    [engine]
  );

  if (!messagesLoaded || !toolboxConfiguration || !sanitizedJson) {
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
      initialJson={sanitizedJson}
      className="h-full w-full"
      onWorkspaceChange={handleWorkspaceChange}
      onJsonChange={debouncedJsonChange}
      onDispose={handleWorkspaceDispose}
    />
  );
}
