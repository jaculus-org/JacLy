import { IIconBlock } from '@/blocks/types/custom-block';
import { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { getImportsForBlock } from '@/blocks/lib/';

export function generateCodeFromWorkspace(workspace: WorkspaceSvg): string {
  const warnings = collectWorkspaceWarnings(workspace);
  let code = javascriptGenerator.workspaceToCode(workspace);

  const allImports = collectImports(workspace);

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

function collectImports(workspace: WorkspaceSvg): string[] {
  const blocks = workspace.getAllBlocks(false);
  const uniqueImports = new Set<string>();

  for (const block of blocks) {
    for (const imp of getImportsForBlock(block.type)) {
      uniqueImports.add(imp);
    }
  }

  return Array.from(uniqueImports);
}

function collectWorkspaceWarnings(workspace: WorkspaceSvg): string[] {
  const warnings: string[] = [];
  const blocks = workspace.getAllBlocks(false); // get all blocks (not just top-level)

  for (const block of blocks) {
    const icon = block.getIcon<IIconBlock>('warning');
    if (icon && icon.textMap) {
      let blockName = block.type;
      const varField =
        block.getField('CONSTRUCTED_VAR_NAME') ||
        block.getField('NVS_INSTANCE');
      if (varField) {
        blockName += ` "${varField.getText()}"`;
      }

      warnings.push(
        `Block [${blockName}]: ${Array.from(icon.textMap.values())}`
      );
    }
  }
  return warnings;
}
