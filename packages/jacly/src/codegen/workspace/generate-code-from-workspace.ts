import type { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import {
  getAllConstructorBlocks,
  getConstructedName,
  isUsableConstructedName,
} from '@/blocks/instances/constructor-name-utils';
import { collectImports } from '@/codegen/imports/collect-workspace-imports';
import { collectWorkspaceWarnings } from '@/codegen/warnings/collect-workspace-warnings';
import type { EngineState } from '../../engine/engine-state';

function collectGlobalConstructorDeclarations(
  state: EngineState,
  workspace: WorkspaceSvg,
): string[] {
  const names = new Set<string>();

  for (const block of getAllConstructorBlocks(state, workspace)) {
    const name = getConstructedName(block);
    if (isUsableConstructedName(name)) names.add(name);
  }

  return Array.from(names)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => `let ${name};`);
}

export function generateCodeFromWorkspace(state: EngineState, workspace: WorkspaceSvg): string {
  const warnings = collectWorkspaceWarnings(workspace);
  let code = javascriptGenerator.workspaceToCode(workspace);
  const globalConstructorDeclarations = collectGlobalConstructorDeclarations(state, workspace);

  const allImports = collectImports(state, workspace);
  const preludeParts: string[] = [];
  if (allImports.length > 0) preludeParts.push(allImports.join('\n'));
  if (globalConstructorDeclarations.length > 0) {
    preludeParts.push(globalConstructorDeclarations.join('\n'));
  }
  if (preludeParts.length > 0) {
    code = `${preludeParts.join('\n\n')}\n\n${code}`;
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
