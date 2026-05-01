import type { JaclyBlockKindBlock } from '@/schema';
import { clonePlainData } from '@/utils/clone-plain-data';

type BlockInputs = NonNullable<JaclyBlockKindBlock['inputs']>;

export function cloneAndMergeInputs(
  registeredInputs: BlockInputs,
  inputOverrides?: JaclyBlockKindBlock['inputs'] | Record<string, unknown>,
): BlockInputs {
  const mergedInputs = clonePlainData(registeredInputs);

  if (inputOverrides) {
    Object.assign(mergedInputs, inputOverrides);
  }

  return mergedInputs;
}
