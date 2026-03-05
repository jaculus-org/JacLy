import { JaclyBlockKindBlock } from '@/blocks/schema';

export function processInputsForRegistration(
  block: JaclyBlockKindBlock,
  inputs: NonNullable<JaclyBlockKindBlock['inputs']>
) {
  block.args0?.forEach(arg => {
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
