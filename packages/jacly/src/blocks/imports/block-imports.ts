import type { JaclyBlock, JaclyConfig } from '@/schema';
import type { EngineState } from '../../engine/engine-state';

export function getImportsForBlock(state: EngineState, blockType: string): string[] {
  const imports = state.blockImports.get(blockType);
  return imports ? Array.from(imports) : [];
}

export function registerAllBlockImports(
  state: EngineState,
  blocks: JaclyBlock[],
  jaclyConfig: JaclyConfig,
): void {
  const configImports = jaclyConfig.import ?? [];

  for (const block of blocks) {
    if (block.kind !== 'block') continue;

    const isCustomBlock =
      block.message0 !== undefined || block.args0 !== undefined || block.code !== undefined;
    if (!isCustomBlock) continue;

    const hasBlockImports = block.import && block.import.length > 0;
    if (configImports.length === 0 && !hasBlockImports) continue;

    const imports = new Set<string>(configImports);
    if (hasBlockImports) {
      for (const imp of block.import!) {
        imports.add(imp);
      }
    }

    state.blockImports.set(block.type, imports);
  }
}
