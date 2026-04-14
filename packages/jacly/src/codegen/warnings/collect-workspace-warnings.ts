import type { WorkspaceSvg } from 'blockly';
import type { IIconBlock } from '@/blocks/types/custom-block';

export function collectWorkspaceWarnings(workspace: WorkspaceSvg): string[] {
  const warnings: string[] = [];
  const blocks = workspace.getAllBlocks(false);

  for (const block of blocks) {
    const icon = block.getIcon<IIconBlock>('warning');
    if (icon?.textMap) {
      let blockName = block.type;
      const varField = block.getField('CONSTRUCTED_VAR_NAME');
      if (varField) blockName += ` "${varField.getText()}"`;
      warnings.push(`Block [${blockName}]: ${Array.from(icon.textMap.values())}`);
    }
  }
  return warnings;
}
