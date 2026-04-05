import { Blocks } from 'blockly/core';
import { JaclyBlock, JaclyConfig } from '../schema';
import { BlockExtended } from '../types/custom-block';
import type { EngineState } from '../engine-state';

export function editInternalBlocks(
  state: EngineState,
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
): void {
  if (block.kind !== 'block') return;

  if (state.editedInternalBlockTypes.has(block.type)) return;
  state.editedInternalBlockTypes.add(block.type);

  const registeredInputs = state.blockInputs.get(block.type);
  if (registeredInputs) {
    if (!block.inputs) {
      block.inputs = { ...registeredInputs };
    } else {
      block.inputs = { ...registeredInputs, ...block.inputs };
    }
  }

  const isUserDefinedBlock = state.registeredBlockTypes.has(block.type);
  if (isUserDefinedBlock) return;

  const colour = block.colour ?? jaclyConfig.colour;
  if (colour) block.colour = colour;

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
