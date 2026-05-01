import type { BlockExtended } from '@/blocks/types/custom-block';
import type { EngineState } from '../../engine/engine-state';
import { getInstanceTracker } from './instance-tracker';

export function validateInstanceSelection(
  this: BlockExtended,
  state: EngineState,
  systemId: string,
  fieldName: string,
): void {
  if (!this.workspace || this.isInFlyout) return;

  const selectedName = this.getFieldValue(fieldName);
  if (!selectedName) return;
  if (selectedName === 'INVALID') {
    this.setWarningText(null);
    return;
  }

  const tracker = getInstanceTracker(state, this.workspace);
  if (!tracker) return;

  if (tracker.hasRealInstance(systemId, selectedName)) {
    this.setWarningText(null);
    return;
  }

  if (tracker.isAmbiguousRealInstance(systemId, selectedName)) {
    this.setWarningText(
      `Please change the selection: "${selectedName}" is used by multiple ${systemId} constructors.`,
    );
    return;
  }

  if (tracker.hasVirtualInstance(systemId, selectedName)) {
    this.setWarningText(null);
    return;
  }

  if (tracker.isAmbiguousVirtualInstance(systemId, selectedName)) {
    this.setWarningText(
      'Virtual instance name is ambiguous. Please rename the provider constructors and re-select.',
    );
    return;
  }

  if (selectedName.includes('.')) {
    this.setWarningText('Virtual instance is no longer valid. Please re-select from the dropdown.');
  } else {
    this.setWarningText(
      `Please change the selection: No "${selectedName}" ${systemId} instance found.`,
    );
  }
}
