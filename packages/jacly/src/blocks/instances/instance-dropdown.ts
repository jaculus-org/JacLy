import * as Blockly from 'blockly/core';
import type { FieldDropdownExtended } from '@/blocks/types/custom-block';
import type { EngineState } from '../../engine/engine-state';

export function getInstanceDropdownGenerator(
  state: EngineState,
  systemId: string,
): () => Blockly.MenuGenerator {
  return function (this: FieldDropdownExtended) {
    const options: [string, string][] = [];
    const constructorBlockTypes = state.constructorTypes.get(systemId);

    const sourceBlock = this.getSourceBlock();
    const workspace = sourceBlock ? sourceBlock.workspace : Blockly.getMainWorkspace();

    if (workspace && constructorBlockTypes) {
      for (const constructorBlockType of constructorBlockTypes) {
        const blocks = workspace.getBlocksByType(constructorBlockType);
        blocks.forEach((block) => {
          const instanceName = block.getFieldValue('CONSTRUCTED_VAR_NAME');
          if (instanceName && instanceName !== `${systemId}_?`) {
            options.push([instanceName, instanceName]);
          }
        });
      }
    }

    if (workspace) {
      const providerBlockTypes = state.virtualInstancesByType.get(systemId) || [];
      for (const providerType of providerBlockTypes) {
        const viDefs = state.virtualInstances.get(providerType) || [];
        const providerBlocks = workspace.getBlocksByType(providerType);
        for (const block of providerBlocks) {
          const constructorVarName = block.getFieldValue('CONSTRUCTED_VAR_NAME');
          if (!constructorVarName || constructorVarName.endsWith('_?')) continue;
          for (const vi of viDefs) {
            if (vi.instanceof === systemId) {
              const label = `${constructorVarName}.${vi.name}`;
              const value = `__vi__${providerType}__${block.id}__${vi.name}`;
              options.push([label, value]);
            }
          }
        }
      }
    }

    const currentValue = this.getValue();
    if (currentValue && currentValue !== 'INVALID') {
      const exists = options.some((opt) => opt[1] === currentValue);
      if (!exists) options.push([currentValue, currentValue]);
    }

    if (sourceBlock?.savedInstanceName) {
      const saved = sourceBlock.savedInstanceName;
      const exists = options.some((opt) => opt[1] === saved);
      if (!exists && saved !== 'INVALID') options.push([saved, saved]);
    }

    options.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

    if (options.length === 0) {
      return [['<Requires init block>', 'INVALID']];
    }

    return options;
  };
}
