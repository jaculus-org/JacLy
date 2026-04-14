import { registerFieldColour } from '@blockly/field-colour';
import type * as Blockly from 'blockly/core';
import type { WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import { registerDocsCallbacks } from '@/toolbox/categories/category-header';
import { registerWorkspaceChangeListener } from '@/workspace/rules/workspace-rules';
import type { EngineState } from './engine-state';

export function attachEngineWorkspace(state: EngineState, workspace: Blockly.WorkspaceSvg): void {
  registerWorkspaceChangeListener(workspace as WorkspaceSvgExtended);
  registerDocsCallbacks(state, workspace);
  registerFieldColour();
}
