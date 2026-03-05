import { JaclyBlock } from '../../schema';
import { blockRegisteredInputs } from './registries';

// Merge in registered inputs for referenced block types
export function enrichBlockInputs(block: JaclyBlock) {
  if (block.kind !== 'block' || !block.inputs) return;

  for (const inputName of Object.keys(block.inputs)) {
    const inputDef = block.inputs[inputName];

    if (inputDef.block) {
      enrichInputNode(inputDef.block);
    }
    if (inputDef.shadow) {
      enrichInputNode(inputDef.shadow);
    }
  }
}

function enrichInputNode(node: {
  type: string;
  inputs?: Record<string, unknown>;
}) {
  const registered = blockRegisteredInputs.get(node.type);
  if (!registered) return;

  if (!node.inputs) {
    // no local inputs — inherit all from registered
    node.inputs = JSON.parse(JSON.stringify(registered));
  } else {
    // merge: local overrides take precedence
    const merged = JSON.parse(JSON.stringify(registered));
    Object.assign(merged, node.inputs);
    node.inputs = merged;
  }

  // recurse into nested block/shadow references
  if (node.inputs) {
    for (const key of Object.keys(node.inputs)) {
      const nested = node.inputs[key] as {
        block?: { type: string; inputs?: Record<string, unknown> };
        shadow?: { type: string; inputs?: Record<string, unknown> };
      };
      if (nested.block) enrichInputNode(nested.block);
      if (nested.shadow) enrichInputNode(nested.shadow);
    }
  }
}
