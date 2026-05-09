import type { JaclyBlockKindBlock } from '@/schema';
import { clonePlainData } from '@/utils/clone-plain-data';

type BlockInputs = NonNullable<JaclyBlockKindBlock['inputs']>;

// must clone because registered inputs are shared — alias overrides must not touch the canonical copy.
// shallow merge; overrides win at top level, nested shadows are replaced wholesale.
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
