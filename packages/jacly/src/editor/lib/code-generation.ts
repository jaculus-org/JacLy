import { IIconBlock } from '@/blocks/types/custom-block';
import { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { getLibraryImportsForBlock } from '@/blocks/lib/blockly';

export function generateCodeFromWorkspace(workspace: WorkspaceSvg): string {
  const warnings = collectWorkspaceWarnings(workspace);
  const libraryImports = collectLibraryImports(workspace);

  let code = javascriptGenerator.workspaceToCode(workspace);

  // Prepend library imports to the generated code
  if (libraryImports.length > 0) {
    code = libraryImports.join('\n') + '\n\n' + code;
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

/**
 * Collect all unique library imports required by blocks in the workspace.
 */
function collectLibraryImports(workspace: WorkspaceSvg): string[] {
  const blocks = workspace.getAllBlocks(false);
  const uniqueImports = new Set<string>();

  for (const block of blocks) {
    const imports = getLibraryImportsForBlock(block.type);
    for (const importStatement of imports) {
      uniqueImports.add(importStatement);
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
