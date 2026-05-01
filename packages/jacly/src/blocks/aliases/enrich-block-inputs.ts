import type { JaclyBlock } from '@/schema';
import type { EngineState } from '../../engine/engine-state';
import { cloneAndMergeInputs } from './input-merging';

export function enrichBlockInputs(state: EngineState, block: JaclyBlock): void {
  if (block.kind !== 'block' || !block.inputs) return;

  for (const inputName of Object.keys(block.inputs)) {
    const inputDef = block.inputs[inputName];
    if (inputDef.block) enrichInputNode(state, inputDef.block, []);
    if (inputDef.shadow) enrichInputNode(state, inputDef.shadow, []);
  }
}

function enrichInputNode(
  state: EngineState,
  node: { type: string; inputs?: Record<string, unknown> },
  typePath: string[],
): void {
  if (typePath.includes(node.type)) {
    throw new Error(
      `Cyclic nested block defaults detected: ${[...typePath, node.type].join(' -> ')}`,
    );
  }

  const registered = state.blockInputs.get(node.type);
  if (!registered) return;

  node.inputs = cloneAndMergeInputs(registered, node.inputs);
  const nextPath = [...typePath, node.type];

  if (node.inputs) {
    for (const key of Object.keys(node.inputs)) {
      const nested = node.inputs[key] as {
        block?: { type: string; inputs?: Record<string, unknown> };
        shadow?: { type: string; inputs?: Record<string, unknown> };
      };
      if (nested.block) enrichInputNode(state, nested.block, nextPath);
      if (nested.shadow) enrichInputNode(state, nested.shadow, nextPath);
    }
  }
}
