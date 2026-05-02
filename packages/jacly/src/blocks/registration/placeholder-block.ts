import { Blocks } from 'blockly/core';
import type { BlockExtended } from '@/blocks/types/custom-block';

let registered = false;

interface PlaceholderExtraState {
  originalState: object | null;
}

interface PlaceholderBlock extends BlockExtended {
  originalState?: object;
}

export function registerPlaceholderBlock(): void {
  if (registered) return;
  registered = true;

  Blocks.unsupported_block = {
    init(this: PlaceholderBlock) {
      this.jsonInit({
        type: 'unsupported_block',
        message0: 'Unsupported block: %1',
        args0: [
          {
            type: 'field_label_serializable',
            name: 'ORIGINAL_TYPE',
            text: '',
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#FF6B6B',
        tooltip: 'Library is not installed or the block type is not supported anymore.',
      });
      this.setDisabledReason(true, 'placeholder');
    },

    saveExtraState(this: PlaceholderBlock): PlaceholderExtraState {
      return { originalState: this.originalState ?? null };
    },

    loadExtraState(this: PlaceholderBlock, state: PlaceholderExtraState): void {
      this.originalState = state.originalState ?? undefined;
      const originalType = (state.originalState as { type?: string })?.type;
      if (originalType) {
        this.setFieldValue(originalType, 'ORIGINAL_TYPE');
      }
    },
  };
}
