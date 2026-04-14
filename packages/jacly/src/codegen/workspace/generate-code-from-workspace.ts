import type { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { collectImports } from '@/codegen/imports/collect-workspace-imports';
import { collectWorkspaceWarnings } from '@/codegen/warnings/collect-workspace-warnings';
import type { EngineState } from '../../engine/engine-state';

export function generateCodeFromWorkspace(state: EngineState, workspace: WorkspaceSvg): string {
  const warnings = collectWorkspaceWarnings(workspace);
  let code = javascriptGenerator.workspaceToCode(workspace);

  const allImports = collectImports(state, workspace);
  if (allImports.length > 0) {
    code = `${allImports.join('\n')}\n\n${code}`;
  }

  if (warnings.length > 0) {
    const warningHeader = [
      '/************************************************',
      ' * ⚠️ WORKSPACE WARNINGS FOUND',
      ' ************************************************',
      ...warnings.map((w) => ` * ${w}`),
      ' ************************************************/',
      '',
      '',
    ].join('\n');
    return warningHeader + code;
  }

  return code;
}
