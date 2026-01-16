import { IIconBlock } from '@/blocks/types/custom-block';
import { WorkspaceSvg } from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export function generateCodeFromWorkspace(workspace: WorkspaceSvg): string {
  const warnings = collectWorkspaceWarnings(workspace);

  let code = javascriptGenerator.workspaceToCode(workspace);
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

function collectWorkspaceWarnings(workspace: WorkspaceSvg): string[] {
  const warnings: string[] = [];
  const blocks = workspace.getAllBlocks(false); // get all blocks (not just top-level)

  for (const block of blocks) {
    const icon = block.getIcon<IIconBlock>('warning');
    if (icon && icon.textMap) {
      let blockName = block.type;
      const varField =
        block.getField('CONSTRUCTED_VAR_NAME') || block.getField('NVS_INSTANCE');
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
