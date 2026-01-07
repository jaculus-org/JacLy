import * as Blockly from 'blockly/core';
import { generateCodeFromWorkspace } from './code-generation';

export function workspaceChange(
  onGeneratedCode: (code: string) => void,
  workspace: Blockly.WorkspaceSvg
) {
  const code = generateCodeFromWorkspace(workspace);
  onGeneratedCode(code);
}
