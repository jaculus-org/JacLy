import { BlockExtended, FieldDropdownExtended } from '../types/custom-block';
import * as Blockly from 'blockly/core';

const constructorTypeMap = new Map<string, string>();

export function registerConstructorType(systemId: string, blockType: string) {
  constructorTypeMap.set(systemId, blockType);
}

/**
 * Returns the Mixin object for the Constructor Block (e.g. nvs_open).
 * Handles the "nvs_?" -> "nvs_0" auto-naming logic.
 */
export function getConstructorMixin(systemId: string) {
  const prefix = systemId + '_'; // e.g. "NVS" -> "nvs_"

  return {
    onchange(this: BlockExtended, e: Blockly.Events.BlockChange) {
      if (!this.workspace || this.isInFlyout) {
        return;
      }

      const fieldName = 'CONSTRUCTED_VAR_NAME';
      const currentName = this.getFieldValue(fieldName);

      // If the user changed the CONSTRUCTED_VAR_NAME field, prevent duplicates by reverting
      if (
        e &&
        e.type === Blockly.Events.BLOCK_CHANGE &&
        e.element === 'field' &&
        e.name === fieldName
      ) {
        const newValue = currentName;
        const oldValue = e.oldValue;

        const constructorBlockType = this.type;
        const blocks = this.workspace.getBlocksByType(constructorBlockType);

        const duplicate = blocks.some(
          block =>
            block.id !== this.id && block.getFieldValue(fieldName) === newValue
        );
        if (duplicate) {
          this.setFieldValue(oldValue ?? `${prefix}?`, fieldName);
        }
      }

      // If the name is still the default placeholder, auto-assign a unique name
      if (currentName === `${prefix}?`) {
        const constructorBlockType = this.type;
        const blocks = this.workspace.getBlocksByType(constructorBlockType);

        let maxIndex = -1;

        blocks.forEach(block => {
          const name = block.getFieldValue(fieldName);
          if (name && name.startsWith(prefix)) {
            const parts = name.split('_');
            // rudimentary check for prefix_number
            if (parts.length === 2) {
              const index = parseInt(parts[1]);
              if (!isNaN(index) && index > maxIndex) maxIndex = index;
            }
          }
        });

        this.setFieldValue(prefix + (maxIndex + 1), fieldName);
      }
    },
  };
}

export function getInstanceDropdownGenerator(
  systemId: string
): () => Blockly.MenuGenerator {
  return function (this: FieldDropdownExtended) {
    const options: [string, string][] = [];

    const constructorBlockType = constructorTypeMap.get(systemId);

    const sourceBlock = this.getSourceBlock();
    const workspace = sourceBlock
      ? sourceBlock.workspace
      : Blockly.getMainWorkspace();

    if (workspace && constructorBlockType) {
      const blocks = workspace.getBlocksByType(constructorBlockType);

      blocks.forEach(block => {
        const instanceName = block.getFieldValue('CONSTRUCTED_VAR_NAME');
        if (instanceName && instanceName !== `${systemId.toLowerCase()}_?`) {
          options.push([instanceName, instanceName]);
        }
      });
    }

    // preserve currently selected value - even if not in the list
    const currentValue = this.getValue();
    if (currentValue && currentValue !== 'INVALID') {
      const exists = options.some(opt => opt[1] === currentValue);
      if (!exists) {
        options.push([currentValue, currentValue]);
      }
    }

    // preserve value being loaded from save file
    if (sourceBlock && sourceBlock.savedInstanceName) {
      const saved = sourceBlock.savedInstanceName;
      const exists = options.some(opt => opt[1] === saved);
      if (!exists && saved !== 'INVALID') {
        options.push([saved, saved]);
      }
    }

    options.sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { numeric: true })
    );

    if (options.length === 0) {
      return [['<No Init Block>', 'INVALID']];
    }

    return options;
  };
}

export function validateInstanceSelection(
  this: BlockExtended,
  systemId: string,
  fieldName: string
) {
  if (!this.workspace || this.isInFlyout) return;

  const targetBlockType = constructorTypeMap.get(systemId);
  if (!targetBlockType) return;

  const selectedName = this.getFieldValue(fieldName);
  if (!selectedName) return;

  const blocks = this.workspace.getBlocksByType(targetBlockType);
  const exists = blocks.some(
    block => block.getFieldValue('CONSTRUCTED_VAR_NAME') === selectedName
  );

  if (!exists) {
    this.setWarningText(
      `Please change the selection: No "${selectedName}" ${systemId} instance found.`
    );
  } else {
    this.setWarningText(null);
  }
}
