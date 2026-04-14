import { Blocks } from 'blockly/core';
import type { BlockExtended } from '@/blocks/types/custom-block';
import type { JaclyBlock, JaclyConfig } from '@/schema';
import type { EngineState } from '../../engine/engine-state';

export function editInternalBlocks(
  state: EngineState,
  block: JaclyBlock,
  jaclyConfig: JaclyConfig,
): void {
  if (block.kind !== 'block') return;

  // Input merging runs for every alias occurrence so each toolbox category gets
  // an independent copy of canonical inputs. Alias-specific inputs win.
  const registeredInputs = state.blockInputs.get(block.type);
  if (registeredInputs) {
    if (!block.inputs) {
      block.inputs = JSON.parse(JSON.stringify(registeredInputs));
    } else {
      const merged = JSON.parse(JSON.stringify(registeredInputs));
      Object.assign(merged, block.inputs);
      block.inputs = merged;
    }
  }

  // Color patch is a global Blockly mutation and only needs to run once.
  if (state.registeredBlockTypes.has(block.type)) return;
  if (state.editedInternalBlockTypes.has(block.type)) return;
  state.editedInternalBlockTypes.add(block.type);

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
