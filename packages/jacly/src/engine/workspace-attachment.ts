import { registerFieldColour } from '@blockly/field-colour';
import * as Blockly from 'blockly/core';
import { getTrackedConstructorBlockTypes } from '@/blocks/instances/constructor-name-utils';
import { createInstanceTracker, getInstanceTracker } from '@/blocks/instances/instance-tracker';
import type { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import { registerDocsCallbacks } from '@/toolbox/categories/category-header';
import { registerWorkspaceChangeListener } from '@/workspace/rules/workspace-rules';
import type { EngineState } from './engine-state';

function isTrackedInstanceBlockType(state: EngineState, blockType: string): boolean {
  return (
    getTrackedConstructorBlockTypes(state).has(blockType) ||
    state.virtualDefsByProviderBlockType.has(blockType)
  );
}

function registerInstanceTrackerListener(
  state: EngineState,
  workspace: Blockly.WorkspaceSvg,
): () => void {
  const listener = (event: Blockly.Events.Abstract) => {
    const tracker = getInstanceTracker(state, workspace);
    if (!tracker) return;

    switch (event.type) {
      case Blockly.Events.BLOCK_DELETE:
        tracker.rebuild();
        return;

      case Blockly.Events.BLOCK_CREATE:
      case Blockly.Events.BLOCK_MOVE:
      case Blockly.Events.BLOCK_CHANGE: {
        const blockEvent = event as Blockly.Events.BlockBase;
        if (!blockEvent.blockId) return;

        const block = workspace.getBlockById(blockEvent.blockId);
        if (!block) return;

        const changeEvent = event as Blockly.Events.BlockChange;
        if (
          event.type === Blockly.Events.BLOCK_CHANGE &&
          changeEvent.element === 'field' &&
          changeEvent.name === 'CONSTRUCTED_VAR_NAME'
        ) {
          tracker.rebuild();
          return;
        }

        if (isTrackedInstanceBlockType(state, block.type)) tracker.rebuild();
        return;
      }

      default:
        return;
    }
  };

  workspace.addChangeListener(listener);
  return () => {
    workspace.removeChangeListener(listener);
  };
}

export function attachEngineWorkspace(
  state: EngineState,
  workspace: Blockly.WorkspaceSvg,
): () => void {
  const disposeWorkspaceRules = registerWorkspaceChangeListener(workspace as WorkspaceSvgExtended);
  registerDocsCallbacks(state, workspace);
  registerFieldColour();
  const tracker = createInstanceTracker(state, workspace);
  state.instanceTrackers.set(workspace, tracker);
  tracker.rebuild();
  const disposeInstanceTracker = registerInstanceTrackerListener(state, workspace);

  return () => {
    disposeInstanceTracker();
    disposeWorkspaceRules();
  };
}
