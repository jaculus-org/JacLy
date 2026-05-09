import type { JaclyBlockKindBlock } from '@/schema';

// args0 lets you write shadow/block inline for convenience, but Blockly expects them in inputs.
// moves them there before registration; inputs is also stored in blockInputs for alias inheritance.
export function processInputsForRegistration(
  block: JaclyBlockKindBlock,
  inputs: NonNullable<JaclyBlockKindBlock['inputs']>,
) {
  block.args0?.forEach((arg) => {
    if (arg.shadow) {
      inputs[arg.name] = {
        shadow: arg.shadow,
      };
    } else if (arg.block) {
      inputs[arg.name] = {
        block: arg.block,
      };
    }
  });
}
