import type { WorkspaceSvg } from 'blockly';
import { getImportsForBlock } from '@/blocks/imports/block-imports';
import type { EngineState } from '../../engine/engine-state';

export function collectImports(state: EngineState, workspace: WorkspaceSvg): string[] {
  const blocks = workspace.getAllBlocks(false);
  const uniqueImports = new Set<string>();
  for (const block of blocks) {
    for (const imp of getImportsForBlock(state, block.type)) {
      uniqueImports.add(imp);
    }
  }
  return Array.from(uniqueImports);
}
