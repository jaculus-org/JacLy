import { IIconBlock } from '../types/custom-block';
import { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { getImportsForBlock } from './block-imports';
import type { EngineState } from '../../engine/engine-state';

export function generateCodeFromWorkspace(
  state: EngineState,
  workspace: WorkspaceSvg
): string {
  const warnings = collectWorkspaceWarnings(workspace);
  let code = javascriptGenerator.workspaceToCode(workspace);

  const allImports = collectImports(state, workspace);
  if (allImports.length > 0) {
    code = allImports.join('\n') + '\n\n' + code;
  }

  if (warnings.length > 0) {
    const warningHeader = [
      '/************************************************',
      ' * ⚠️ WORKSPACE WARNINGS FOUND',
      ' ************************************************',
      ...warnings.map(w => ' * ' + w),
      ' ************************************************/',
      '',
      '',
    ].join('\n');
    return warningHeader + code;
  }

  return code;
}

export function collectImports(
  state: EngineState,
  workspace: WorkspaceSvg
): string[] {
  const blocks = workspace.getAllBlocks(false);
  const uniqueImports = new Set<string>();
  for (const block of blocks) {
    for (const imp of getImportsForBlock(state, block.type)) {
      uniqueImports.add(imp);
    }
  }
  return Array.from(uniqueImports);
}

export function collectWorkspaceWarnings(workspace: WorkspaceSvg): string[] {
  const warnings: string[] = [];
  const blocks = workspace.getAllBlocks(false);

  for (const block of blocks) {
    const icon = block.getIcon<IIconBlock>('warning');
    if (icon && icon.textMap) {
      let blockName = block.type;
      const varField = block.getField('CONSTRUCTED_VAR_NAME');
      if (varField) blockName += ` "${varField.getText()}"`;
      warnings.push(
        `Block [${blockName}]: ${Array.from(icon.textMap.values())}`
      );
    }
  }
  return warnings;
}
