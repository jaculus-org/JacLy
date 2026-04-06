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

function isRegistered(type: string): boolean {
  return !!Blockly.Blocks[type];
}

function makePlaceholder(
  original: BlockState,
  x?: number,
  y?: number
): BlockState {
  return {
    type: 'unsupported_block',
    fields: { ORIGINAL_TYPE: original.type },
    extraState: { originalState: original },
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
  };
}

/**
 * Walk a block node in-place (on the clone). Returns an array of hoisted
 * placeholder blocks that could not be placed inline (nested input blocks).
 */
function walkBlock(node: BlockState, hoisted: BlockState[]): BlockState {
  // Process inputs
  if (node.inputs) {
    for (const key of Object.keys(node.inputs)) {
      const input = node.inputs[key];

      if (input.shadow && !isRegistered(input.shadow.type)) {
        delete input.shadow;
      } else if (input.shadow) {
        walkBlock(input.shadow, hoisted);
      }

      if (input.block) {
        if (!isRegistered(input.block.type)) {
          // Cannot replace inline — hoist to top-level
          hoisted.push(makePlaceholder(input.block));
          delete input.block;
        } else {
          input.block = walkBlock(input.block, hoisted);
        }
      }
    }
  }

  // Process next chain
  if (node.next?.block) {
    if (!isRegistered(node.next.block.type)) {
      node.next.block = makePlaceholder(node.next.block);
    } else {
      node.next.block = walkBlock(node.next.block, hoisted);
    }
  }

  if (node.next?.shadow && !isRegistered(node.next.shadow.type)) {
    delete node.next.shadow;
  }

  return node;
}

export async function sanitizeWorkspaceState(
  json: object,
  onMissingPackage: (packageName: string, blockType: string) => Promise<boolean>
): Promise<object> {
  const ws = json as WorkspaceState;
  if (!ws.blocks?.blocks) return json;

  const clone = JSON.parse(JSON.stringify(ws)) as WorkspaceState;
  const topBlocks = clone.blocks!.blocks;

  // Collect all missing types and their block nodes — keyed by type
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

  for (const block of topBlocks) collectMissing(block);

  if (missingByType.size === 0) return clone;

  // Group missing types by package
  const byPackage = new Map<string, Set<string>>();
  for (const [type, nodes] of missingByType) {
    const pkg =
      (nodes[0].extraState?.package as string | undefined) ?? 'unknown';
    const types = byPackage.get(pkg) ?? new Set<string>();
    types.add(type);
    byPackage.set(pkg, types);
  }

  // Notify caller — one call per package, all concurrent
  const results = await Promise.allSettled(
    Array.from(byPackage.entries()).map(([pkg, types]) =>
      onMissingPackage(pkg, types.values().next().value as string).then(
        (installed): [string, boolean] => [pkg, installed]
      )
    )
  );

  // Mark which packages were successfully installed
  const installedPackages = new Set<string>();
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value[1]) {
      installedPackages.add(result.value[0]);
    }
  }

  // Walk top-level blocks: replace still-missing ones, collect hoisted placeholders
  const hoisted: BlockState[] = [];

  clone.blocks!.blocks = topBlocks.map(block => {
    if (!isRegistered(block.type)) {
      return makePlaceholder(block, block.x, block.y);
    }
    return walkBlock(block, hoisted);
  });

  clone.blocks!.blocks.push(...hoisted);

  return clone;
}
