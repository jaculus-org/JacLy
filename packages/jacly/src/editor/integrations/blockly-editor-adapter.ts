import * as Blockly from 'blockly/core';
import { registerJaclyCustomCategory } from '@/editor/lib/custom-category';
import { registerCrossTabCopyPaste } from '@/editor/plugins/cross-tab-copy-paste';
import {
  attachWorkspaceBackpack,
  disposeWorkspaceBackpack,
} from '@/editor/plugins/workspace-backpack';

let registered = false;

export function registerBlocklyEditorIntegrations(): void {
  if (registered) return;
  registered = true;
  registerJaclyCustomCategory();
  registerCrossTabCopyPaste();
}

export function attachBlocklyEditorWorkspace(
  workspace: Blockly.WorkspaceSvg
): void {
  registerBlocklyEditorIntegrations();
  attachWorkspaceBackpack(workspace);
}

export function detachBlocklyEditorWorkspace(
  workspace: Blockly.WorkspaceSvg
): void {
  disposeWorkspaceBackpack(workspace);
}
