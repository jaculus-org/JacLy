import type { InputNode, JaclyBlock } from '@/schema';
import type { EngineState } from '../../engine/engine-state';
import { cloneAndMergeInputs } from './input-merging';

export function enrichBlockInputs(state: EngineState, block: JaclyBlock): void {
  if (block.kind !== 'block') return;

  if (block.inputs) {
    for (const inputName of Object.keys(block.inputs)) {
      const inputDef = block.inputs[inputName];
      if (inputDef.block) enrichInputNode(state, inputDef.block, []);
      if (inputDef.shadow) enrichInputNode(state, inputDef.shadow, []);
    }
  }

  if (block.next?.block) enrichInputNode(state, block.next.block, []);
  if (block.next?.shadow) enrichInputNode(state, block.next.shadow, []);
}

function enrichInputNode(state: EngineState, node: InputNode, typePath: string[]): void {
  if (typePath.includes(node.type)) {
    throw new Error(
      `Cyclic nested block defaults detected: ${[...typePath, node.type].join(' -> ')}`,
    );
  }

  const registered = state.blockInputs.get(node.type);
  const nextPath = [...typePath, node.type];

  if (registered) {
    node.inputs = cloneAndMergeInputs(registered, node.inputs);

    for (const key of Object.keys(node.inputs)) {
      const nested = node.inputs[key];
      if (nested.block) enrichInputNode(state, nested.block, nextPath);
      if (nested.shadow) enrichInputNode(state, nested.shadow, nextPath);
    }
  }

  if (node.next?.block) enrichInputNode(state, node.next.block, nextPath);
  if (node.next?.shadow) enrichInputNode(state, node.next.shadow, nextPath);
}
