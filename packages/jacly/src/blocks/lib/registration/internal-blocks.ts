import { Blocks } from 'blockly/core';
import { JaclyBlock, JaclyConfig } from '../../schema';
import { BlockExtended } from '../../types/custom-block';
import {
  blockRegisteredInputs,
  editedInternalBlockTypes,
  registeredBlockTypes,
} from './registries';

// Apply color overrides to built-in blocks
export function editInternalBlocks(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (block.kind !== 'block') {
    return;
  }

  if (editedInternalBlockTypes.has(block.type)) {
    return;
  }
  editedInternalBlockTypes.add(block.type);

  // Inherit inputs (shadows/blocks) from original registration if not overridden
  const registeredInputs = blockRegisteredInputs.get(block.type);
  if (registeredInputs) {
    if (!block.inputs) {
      // No local inputs — inherit all from original
      block.inputs = { ...registeredInputs };
    } else {
      // Merge: local overrides take precedence per input name
      block.inputs = { ...registeredInputs, ...block.inputs };
    }
  }

  const isUserDefinedBlock = registeredBlockTypes.has(block.type);
  if (isUserDefinedBlock) {
    return;
  }

  const colour = block.colour ?? jaclyConfig.colour;

  if (colour) {
    block.colour = colour;
  }

  if (colour && Blocks[block.type]) {
    const originalInit = Blocks[block.type].init;
    Blocks[block.type] = {
      ...Blocks[block.type],
      init(this: BlockExtended) {
        if (originalInit) originalInit.call(this);
        if (colour) this.setColour(colour);
      },
    };
  }
}
