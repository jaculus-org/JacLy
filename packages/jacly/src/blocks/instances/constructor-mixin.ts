import type * as Blockly from 'blockly/core';
import type { BlockExtended } from '@/blocks/types/custom-block';
import type { EngineState } from '@/engine/engine-state';
import {
  getConstructedName,
  getNextConstructedName,
  hasDuplicateConstructedName,
  isPlaceholderConstructedName,
  isValidConstructedName,
} from './constructor-name-utils';
import { getInstanceTracker } from './instance-tracker';

// mixed into every constructor block, fires on every workspace event:
// 1. resolve _? placeholder -> next available index (return early so next event sees the real name)
// 2. validate name, push warning bubble
// 3. rebuild tracker so downstream dropdowns update immediately
// tracker rebuild is intentional — it's a plain snapshot, not reactive.
export function getConstructorMixin(state: EngineState, constructType: string) {
  return {
    onchange(this: BlockExtended, _e: Blockly.Events.Abstract) {
      if (!this.workspace || this.isInFlyout || !this.isEnabled()) return;

      const field = this.getField('CONSTRUCTED_VAR_NAME');
      if (!field) return;

      const currentName = getConstructedName(this);

      if (isPlaceholderConstructedName(currentName)) {
        const nextName = getNextConstructedName(state, this.workspace, constructType);
        if (nextName !== currentName) {
          field.setValue(nextName);
          return;
        }
      }

      const name = getConstructedName(this);
      const issues: string[] = [];

      if (!name) {
        issues.push('Constructor name is required.');
      } else if (!isValidConstructedName(name)) {
        issues.push('Constructor name must be a valid identifier.');
      } else if (hasDuplicateConstructedName(state, this.workspace, name, this.id)) {
        issues.push(`Constructor name "${name}" is already used by another constructor block.`);
      }

      const tracker = getInstanceTracker(state, this.workspace);
      tracker?.rebuild();
      this.setWarningText(issues.length > 0 ? issues.join(' ') : null);
    },
  };
}
