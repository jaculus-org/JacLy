import * as Blockly from 'blockly/core';
import type { BlockState, UnsupportedBlockExtraState } from './types';

export function isRegistered(type: string): boolean {
  return !!Blockly.Blocks[type];
}

// x/y only for top-level canvas blocks; inline blocks have no position
export function makePlaceholder(original: BlockState, x?: number, y?: number): BlockState {
  const extra: UnsupportedBlockExtraState = { originalState: original };
  return {
    type: 'unsupported_block',
    fields: { ORIGINAL_TYPE: original.type },
    extraState: extra as unknown as Record<string, unknown>,
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
  };
}

function tryRestore(node: BlockState): {
  block: BlockState;
  restored: boolean;
} {
  if (node.type !== 'unsupported_block') {
    return { block: node, restored: false };
  }
  const extra = node.extraState as unknown as UnsupportedBlockExtraState | undefined;
  const original = extra?.originalState;
  if (!original || !isRegistered(original.type)) {
    return { block: node, restored: false };
  }
  return { block: original, restored: true };
}

export function restoreBlock(node: BlockState, restored: Set<string>): BlockState {
  const { block: current, restored: didRestore } = tryRestore(node);
  if (didRestore) {
    restored.add(current.type);
  }

  if (current.inputs) {
    for (const key of Object.keys(current.inputs)) {
      const input = current.inputs[key];
      if (input.block) {
        input.block = restoreBlock(input.block, restored);
      }
      if (input.shadow) {
        input.shadow = restoreBlock(input.shadow, restored);
      }
    }
  }

  if (current.next?.block) {
    current.next.block = restoreBlock(current.next.block, restored);
  }
  if (current.next?.shadow) {
    current.next.shadow = restoreBlock(current.next.shadow, restored);
  }

  return current;
}
