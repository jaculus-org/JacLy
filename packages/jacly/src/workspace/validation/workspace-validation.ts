import { clonePlainData } from '@/utils/clone-plain-data';
import { collectMissingBlockTypes, groupMissingPackages } from './missing-blocks';
import type {
  BlockState,
  EngineMissingPackages,
  InputState,
  SanitizationResult,
  WorkspaceState,
} from './types';
import { isRegistered, makePlaceholder, restoreBlock } from './unsupported-blocks';

export type { SanitizationResult };

type RegisteredInputsLookup = (type: string) => Record<string, InputState> | undefined;

function mergeRegisteredInputs(
  registeredInputs: Record<string, InputState>,
  currentInputs?: Record<string, InputState>,
): Record<string, InputState> {
  const merged = clonePlainData(registeredInputs);
  if (!currentInputs) return merged;

  for (const [name, inputState] of Object.entries(currentInputs)) {
    merged[name] = clonePlainData(inputState);
  }

  return merged;
}

function enrichWithRegisteredInputs(
  node: BlockState,
  getRegisteredInputs?: RegisteredInputsLookup,
  typePath: string[] = [],
): BlockState {
  if (!getRegisteredInputs) return node;
  if (typePath.includes(node.type)) return node;

  const registeredInputs = getRegisteredInputs(node.type);
  if (registeredInputs) {
    node.inputs = mergeRegisteredInputs(registeredInputs, node.inputs);
  }

  const nextPath = [...typePath, node.type];

  if (node.inputs) {
    for (const input of Object.values(node.inputs)) {
      if (input.block) {
        input.block = enrichWithRegisteredInputs(input.block, getRegisteredInputs, nextPath);
      }
      if (input.shadow) {
        input.shadow = enrichWithRegisteredInputs(input.shadow, getRegisteredInputs, nextPath);
      }
    }
  }

  if (node.next?.block) {
    node.next.block = enrichWithRegisteredInputs(node.next.block, getRegisteredInputs, nextPath);
  }
  if (node.next?.shadow) {
    node.next.shadow = enrichWithRegisteredInputs(node.next.shadow, getRegisteredInputs, nextPath);
  }

  return node;
}

function replaceBlock(node: BlockState, hoisted: BlockState[], replaced: Set<string>): BlockState {
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

// three passes:
// 1. restore unsupported_block placeholders whose packages are now loaded; enrich with current shadows
// 2. collect still-missing types -> call onMissingPackage so the caller can prompt for install
// 3. replace remaining unresolved blocks with placeholders; inline ones are hoisted to canvas
export async function sanitizeWorkspaceState(
  json: object,
  onMissingPackage: (missingPackages: EngineMissingPackages) => Promise<void>,
  getRegisteredInputs?: RegisteredInputsLookup,
): Promise<SanitizationResult> {
  const ws = json as WorkspaceState;
  if (!ws.blocks?.blocks) {
    return { state: json, restoredTypes: [], replacedTypes: [] };
  }

  const clone = JSON.parse(JSON.stringify(ws)) as WorkspaceState;
  const restoredTypes = new Set<string>();
  const replacedTypes = new Set<string>();

  clone.blocks!.blocks = clone.blocks!.blocks.map((block) =>
    enrichWithRegisteredInputs(restoreBlock(block, restoredTypes), getRegisteredInputs),
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

  clone.blocks!.blocks = clone.blocks!.blocks.map((block) => {
    if (!isRegistered(block.type)) {
      replacedTypes.add(block.type);
      return makePlaceholder(block, block.x, block.y);
    }
    return enrichWithRegisteredInputs(
      replaceBlock(block, hoisted, replacedTypes),
      getRegisteredInputs,
    );
  });

  clone.blocks?.blocks.push(
    ...hoisted.map((block) => enrichWithRegisteredInputs(block, getRegisteredInputs)),
  );

  return {
    state: clone,
    restoredTypes: [...restoredTypes],
    replacedTypes: [...replacedTypes],
  };
}
