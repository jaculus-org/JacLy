import type {
  BlockState,
  EngineMissingPackages,
  SanitizationResult,
  WorkspaceState,
} from './types';
import {
  collectMissingBlockTypes,
  groupMissingPackages,
} from './missing-blocks';
import {
  isRegistered,
  makePlaceholder,
  restoreBlock,
} from './unsupported-blocks';

export type { SanitizationResult };

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

  clone.blocks!.blocks = clone.blocks!.blocks.map(block =>
    restoreBlock(block, restoredTypes)
  );

  const missingByType = collectMissingBlockTypes(clone.blocks!.blocks);

  if (missingByType.size === 0) {
    return {
      state: clone,
      restoredTypes: [...restoredTypes],
      replacedTypes: [],
    };
  }

  await onMissingPackage(groupMissingPackages(missingByType));

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
