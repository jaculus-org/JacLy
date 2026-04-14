import { BlockExtended } from '@/blocks/types/custom-block';
import * as Blockly from 'blockly/core';

export function getConstructorMixin(systemId: string) {
  const prefix = systemId + '_';

  return {
    onchange(this: BlockExtended, e: Blockly.Events.BlockChange) {
      if (!this.workspace || this.isInFlyout) return;

      const fieldName = 'CONSTRUCTED_VAR_NAME';
      const currentName = this.getFieldValue(fieldName);

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

      if (currentName === `${prefix}?`) {
        const constructorBlockType = this.type;
        const blocks = this.workspace.getBlocksByType(constructorBlockType);
        let maxIndex = -1;
        blocks.forEach(block => {
          const name = block.getFieldValue(fieldName);
          if (name && name.startsWith(prefix)) {
            const suffix = name.slice(prefix.length);
            const index = parseInt(suffix);
            if (!isNaN(index) && index > maxIndex) maxIndex = index;
          }
        });
        this.setFieldValue(prefix + (maxIndex + 1), fieldName);
      }
    },
  };
}
