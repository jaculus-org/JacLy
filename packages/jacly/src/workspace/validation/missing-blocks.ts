import type { BlockState, EngineMissingPackages } from './types';
import { isRegistered } from './unsupported-blocks';

export function collectMissingBlockTypes(
  blocks: BlockState[]
): Map<string, BlockState[]> {
  const missingByType = new Map<string, BlockState[]>();

  function collectMissing(node: BlockState): void {
    if (!isRegistered(node.type)) {
      const list = missingByType.get(node.type) ?? [];
      list.push(node);
      missingByType.set(node.type, list);
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

export function groupMissingPackages(
  missingByType: Map<string, BlockState[]>
): EngineMissingPackages {
  const byPackage = new Map<string, Set<string>>();
  for (const [type, nodes] of missingByType) {
    const pkg =
      (nodes[0].extraState?.package as string | undefined) ?? 'unknown';
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
