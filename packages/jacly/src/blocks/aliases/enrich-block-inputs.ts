import { JaclyBlock } from '@/schema';
import type { EngineState } from '../../engine/engine-state';

export function enrichBlockInputs(state: EngineState, block: JaclyBlock): void {
  if (block.kind !== 'block' || !block.inputs) return;

  for (const inputName of Object.keys(block.inputs)) {
    const inputDef = block.inputs[inputName];
    if (inputDef.block) enrichInputNode(state, inputDef.block);
    if (inputDef.shadow) enrichInputNode(state, inputDef.shadow);
  }
}

function enrichInputNode(
  state: EngineState,
  node: { type: string; inputs?: Record<string, unknown> }
): void {
  const registered = state.blockInputs.get(node.type);
  if (!registered) return;

  if (!node.inputs) {
    node.inputs = JSON.parse(JSON.stringify(registered));
  } else {
    const merged = JSON.parse(JSON.stringify(registered));
    Object.assign(merged, node.inputs);
    node.inputs = merged;
  }

  if (node.inputs) {
    for (const key of Object.keys(node.inputs)) {
      const nested = node.inputs[key] as {
        block?: { type: string; inputs?: Record<string, unknown> };
        shadow?: { type: string; inputs?: Record<string, unknown> };
      };
      if (nested.block) enrichInputNode(state, nested.block);
      if (nested.shadow) enrichInputNode(state, nested.shadow);
    }
  }
}
