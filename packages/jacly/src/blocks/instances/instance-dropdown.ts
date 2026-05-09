import * as Blockly from 'blockly/core';
import type { FieldDropdownExtended } from '@/blocks/types/custom-block';
import type { EngineState } from '../../engine/engine-state';
import { getInstanceTracker } from './instance-tracker';

// menu generator re-runs on every open. two fallbacks stop the field losing its value:
// currentValue   — keeps the current value visible during tracker rebuild cycles
// savedInstanceNames[fieldName] — set by loadExtraState; deserialized blocks can arrive before
//   their constructor exists, so we inject the saved name until the tracker catches up
export function getInstanceDropdownGenerator(
  state: EngineState,
  systemId: string,
): () => Blockly.MenuGenerator {
  return function (this: FieldDropdownExtended) {
    const sourceBlock = this.getSourceBlock();
    const workspace = sourceBlock ? sourceBlock.workspace : Blockly.getMainWorkspace();
    const tracker = getInstanceTracker(state, workspace);
    const options = (tracker?.getOptions(systemId) || []).map((value): [string, string] => [
      value,
      value,
    ]);

    const currentValue = this.getValue();
    if (currentValue && currentValue !== 'INVALID') {
      const exists = options.some((opt) => opt[1] === currentValue);
      if (!exists) options.push([currentValue, currentValue]);
    }

    const fieldName = this.name;
    const savedByField = fieldName && sourceBlock?.savedInstanceNames?.[fieldName];
    const savedFallback = savedByField || sourceBlock?.savedInstanceName;
    if (savedFallback) {
      const exists = options.some((opt) => opt[1] === savedFallback);
      if (!exists && savedFallback !== 'INVALID') options.push([savedFallback, savedFallback]);
    }

    options.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

    if (options.length === 0) {
      return [['<Requires init block>', 'INVALID']];
    }

    return options;
  };
}
