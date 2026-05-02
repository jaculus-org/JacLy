import BlocklyWorkspace from '@kuband/react-blockly/dist/BlocklyWorkspace';
import 'blockly/blocks';
import type { JaclyBlocksData } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import {
  attachBlocklyEditorWorkspace,
  detachBlocklyEditorWorkspace,
  registerBlocklyEditorIntegrations,
} from '@/editor/integrations/blockly-editor-adapter';
import { getBlocklyTheme } from '@/editor/theme/theme';
import type { Theme } from '@/editor/types/theme';
import type { JaclyEngine } from '@/engine/engine';
import type { EngineMissingPackages } from '@/workspace/validation/types';
import { useBlocklyMessages } from '../hooks/use-blockly-messages';
import { JaclyLoading } from './loading';
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

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
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
  const [toolboxConfiguration, setToolboxConfiguration] =
    useState<Blockly.utils.toolbox.ToolboxDefinition | null>(null);
  const [sanitizedJson, setSanitizedJson] = useState<object | null>(null);
  const [editorError, setEditorError] = useState<Error | null>(null);
  const workspaceRef = useRef<WorkspaceSvgExtended | null>(null);
  const hasImportedWorkspaceStateRef = useRef(false);
  const prevInitialJsonRef = useRef(initialJson);

  useEffect(() => {
    if (!messagesLoaded) return;
    setEditorError(null);

    try {
      setToolboxConfiguration(engine.reloadBlockData(jaclyBlocksData));
    } catch (error) {
      setToolboxConfiguration(null);
      setEditorError(toError(error));
    }
  }, [jaclyBlocksData, messagesLoaded, engine]);

  useEffect(() => {
    if (!toolboxConfiguration) return;

    const initialJsonChanged = prevInitialJsonRef.current !== initialJson;
    prevInitialJsonRef.current = initialJson;

    const inputJson =
      !initialJsonChanged && hasImportedWorkspaceStateRef.current && workspaceRef.current
        ? Blockly.serialization.workspaces.save(workspaceRef.current)
        : initialJson;

    let cancelled = false;
    const task = onMissingPackage
      ? engine.validateWorkspace(inputJson, onMissingPackage)
      : Promise.resolve({
          state: inputJson,
          restoredTypes: [] as string[],
          replacedTypes: [] as string[],
        });
    task
      .then((result) => {
        if (!cancelled) setSanitizedJson(result.state);
      })
      .catch((error) => {
        if (!cancelled) setEditorError(toError(error));
      });
    return () => {
      cancelled = true;
    };
  }, [initialJson, engine, onMissingPackage, toolboxConfiguration]);

  const handleWorkspaceChange = useCallback(
    (workspace: WorkspaceSvgExtended) => {
      workspaceRef.current = workspace;
      if (workspace.getAllBlocks(false).length > 0 || workspace.getTopComments().length > 0) {
        hasImportedWorkspaceStateRef.current = true;
      }
      engine.attachToWorkspace(workspace);
      attachBlocklyEditorWorkspace(workspace);
      onGeneratedCode(engine.generateCode(workspace));
    },
    [engine, onGeneratedCode],
  );

  const handleWorkspaceDispose = useCallback(
    (workspace: WorkspaceSvgExtended) => {
      if (workspaceRef.current === workspace) {
        workspaceRef.current = null;
        hasImportedWorkspaceStateRef.current = false;
      }
      detachBlocklyEditorWorkspace(workspace);
      engine.detachFromWorkspace(workspace);
    },
    [engine],
  );

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || !sanitizedJson || !hasImportedWorkspaceStateRef.current) {
      return;
    }

    const currentState = Blockly.serialization.workspaces.save(workspace);
    if (JSON.stringify(currentState) === JSON.stringify(sanitizedJson)) {
      return;
    }

    Blockly.Events.disable();
    try {
      workspace.clear();
      Blockly.serialization.workspaces.load(sanitizedJson, workspace);
    } finally {
      Blockly.Events.enable();
    }

    onJsonChange(sanitizedJson);
    onGeneratedCode(engine.generateCode(workspace));
  }, [engine, onGeneratedCode, onJsonChange, sanitizedJson]);

  if (editorError) throw editorError;
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
      onJsonChange={onJsonChange}
      onDispose={handleWorkspaceDispose}
    />
  );
}
