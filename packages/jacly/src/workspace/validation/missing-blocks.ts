import type { BlockState, EngineMissingPackages } from './types';
import { isRegistered } from './unsupported-blocks';

export function collectMissingBlockTypes(blocks: BlockState[]): Map<string, BlockState[]> {
  const missingByType = new Map<string, BlockState[]>();

  function addMissing(node: BlockState): void {
    const list = missingByType.get(node.type) ?? [];
    list.push(node);
    missingByType.set(node.type, list);
  }

  function collectMissing(node: BlockState): void {
    if (node.type === 'unsupported_block') {
      // unsupported_block itself is registered — the missing type lives in its originalState
      const originalState = node.extraState?.originalState as BlockState | undefined;
      if (originalState && !isRegistered(originalState.type)) {
        addMissing(originalState);
        return;
      }
    }

    if (!isRegistered(node.type)) {
      addMissing(node);
    }
    if (node.inputs) {
      for (const input of Object.values(node.inputs)) {
        if (input.block) collectMissing(input.block);
        if (input.shadow) collectMissing(input.shadow);
      }
    }
    if (node.next?.block) collectMissing(node.next.block);
    if (node.next?.shadow) collectMissing(node.next.shadow);
  }

  for (const block of blocks) collectMissing(block);
  return missingByType;
}

// groups by package (from extraState.package saved when the block was first created)
// so the caller can show "install X" rather than a list of raw block types
export function groupMissingPackages(
  missingByType: Map<string, BlockState[]>,
): EngineMissingPackages {
  const byPackage = new Map<string, Set<string>>();
  for (const [type, nodes] of missingByType) {
    const pkg = (nodes[0].extraState?.package as string | undefined) ?? 'unknown';
    const types = byPackage.get(pkg) ?? new Set<string>();
    types.add(type);
    byPackage.set(pkg, types);
  }

  const missingPackages: EngineMissingPackages = {};
  for (const [pkg, types] of byPackage) {
    missingPackages[pkg] = types;
  }
  return missingPackages;
}
