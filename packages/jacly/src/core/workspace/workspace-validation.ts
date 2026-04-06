import { EngineMissingPackages } from '@/engine/engine';
import * as Blockly from 'blockly/core';

interface BlockState {
  type: string;
  id?: string;
  x?: number;
  y?: number;
  fields?: Record<string, unknown>;
  inputs?: Record<string, InputState>;
  next?: { block?: BlockState; shadow?: BlockState };
  extraState?: Record<string, unknown>;
}

interface InputState {
  block?: BlockState;
  shadow?: BlockState;
}

interface WorkspaceState {
  blocks?: {
    languageVersion?: number;
    blocks: BlockState[];
  };
}

interface UnsupportedBlockExtraState {
  originalState: BlockState;
}

export interface SanitizationResult {
  state: object;
  restoredTypes: string[];
  replacedTypes: string[];
}

function isRegistered(type: string): boolean {
  return !!Blockly.Blocks[type];
}

function makePlaceholder(
  original: BlockState,
  x?: number,
  y?: number
): BlockState {
  const extra: UnsupportedBlockExtraState = { originalState: original };
  return {
    type: 'unsupported_block',
    fields: { ORIGINAL_TYPE: original.type },
    extraState: extra as unknown as Record<string, unknown>,
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
  };
}

// If the node is an unsupported_block and its original type is now available,
// swap it back to the original. Otherwise keep as-is.
function tryRestore(node: BlockState): {
  block: BlockState;
  restored: boolean;
} {
  if (node.type !== 'unsupported_block') {
    return { block: node, restored: false };
  }
  const extra = node.extraState as unknown as
    | UnsupportedBlockExtraState
    | undefined;
  const original = extra?.originalState;
  if (!original || !isRegistered(original.type)) {
    return { block: node, restored: false };
  }
  return { block: original, restored: true };
}

// Walk the block tree and restore any placeholders whose type came back
function restoreBlock(node: BlockState, restored: Set<string>): BlockState {
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

// Walk a block and convert missing types to placeholders.
// Nested input blocks that are missing get hoisted to top-level.
function replaceBlock(
  node: BlockState,
  hoisted: BlockState[],
  replaced: Set<string>
): BlockState {
  if (node.inputs) {
    for (const key of Object.keys(node.inputs)) {
      const input = node.inputs[key];

      if (input.shadow && !isRegistered(input.shadow.type)) {
        delete input.shadow;
      } else if (input.shadow) {
        replaceBlock(input.shadow, hoisted, replaced);
      }

      if (input.block) {
        if (!isRegistered(input.block.type)) {
          // can't inline a placeholder here, hoist it
          replaced.add(input.block.type);
          hoisted.push(makePlaceholder(input.block));
          delete input.block;
        } else {
          input.block = replaceBlock(input.block, hoisted, replaced);
        }
      }
    }
  }

  if (node.next?.block) {
    if (!isRegistered(node.next.block.type)) {
      replaced.add(node.next.block.type);
      node.next.block = makePlaceholder(node.next.block);
    } else {
      node.next.block = replaceBlock(node.next.block, hoisted, replaced);
    }
  }

  if (node.next?.shadow && !isRegistered(node.next.shadow.type)) {
    delete node.next.shadow;
  }

  return node;
}

export async function sanitizeWorkspaceState(
  json: object,
  onMissingPackage: (missingPackages: EngineMissingPackages) => Promise<void>
): Promise<SanitizationResult> {
  const ws = json as WorkspaceState;
  if (!ws.blocks?.blocks) {
    return { state: json, restoredTypes: [], replacedTypes: [] };
  }

  const clone = JSON.parse(JSON.stringify(ws)) as WorkspaceState;
  const restoredTypes = new Set<string>();
  const replacedTypes = new Set<string>();

  // restore placeholders whose types now exist
  clone.blocks!.blocks = clone.blocks!.blocks.map(block =>
    restoreBlock(block, restoredTypes)
  );

  // collect still-missing types
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

  for (const block of clone.blocks!.blocks) collectMissing(block);

  if (missingByType.size === 0) {
    return {
      state: clone,
      restoredTypes: [...restoredTypes],
      replacedTypes: [],
    };
  }

  // group missing types by package and notify
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
  await onMissingPackage(missingPackages);

  // replace still-missing blocks with placeholders
  const hoisted: BlockState[] = [];

  clone.blocks!.blocks = clone.blocks!.blocks.map(block => {
    if (!isRegistered(block.type)) {
      replacedTypes.add(block.type);
      return makePlaceholder(block, block.x, block.y);
    }
    return replaceBlock(block, hoisted, replacedTypes);
  });

  clone.blocks!.blocks.push(...hoisted);

  return {
    state: clone,
    restoredTypes: [...restoredTypes],
    replacedTypes: [...replacedTypes],
  };
}
