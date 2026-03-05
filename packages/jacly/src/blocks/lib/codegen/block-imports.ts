import { JaclyBlock, JaclyConfig } from '../../schema';
import { blockStaticImports } from '../registration/registries';

// Retrieve the static imports for a block
export function getImportsForBlock(blockType: string): string[] {
  const imports = blockStaticImports.get(blockType);
  return imports ? Array.from(imports) : [];
}

// Collect and register imports from all blocks in a config
export function registerAllBlockImports(
  blocks: JaclyBlock[],
  jaclyConfig: JaclyConfig
) {
  const configImports = jaclyConfig.import ?? [];

  for (const block of blocks) {
    if (block.kind !== 'block') continue;

    const hasBlockImports = block.import && block.import.length > 0;
    if (configImports.length === 0 && !hasBlockImports) continue;

    const imports = new Set<string>(configImports);

    if (hasBlockImports) {
      for (const imp of block.import!) {
        imports.add(imp);
      }
    }

    blockStaticImports.set(block.type, imports);
  }
}
