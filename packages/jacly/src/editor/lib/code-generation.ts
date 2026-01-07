import { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export function generateCodeFromWorkspace(workspace: WorkspaceSvg): string {
  let code = javascriptGenerator.workspaceToCode(workspace);
  return code;
}
