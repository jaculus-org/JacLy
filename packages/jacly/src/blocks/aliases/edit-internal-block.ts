import { Blocks } from 'blockly/core';
import type { BlockExtended } from '@/blocks/types/custom-block';
import type { JaclyBlock, JaclyConfig } from '@/schema';
import type { EngineState } from '../../engine/engine-state';
import { cloneAndMergeInputs } from './input-merging';

// alias = block referenced by type only, no full definition, reuses another package's registration.
// inputs are merged per-occurrence (each category can override shadows independently).
// color patch wraps Blockly.Blocks[type].init globally and only runs once per type.
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
    block.inputs = cloneAndMergeInputs(registeredInputs, block.inputs);
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
