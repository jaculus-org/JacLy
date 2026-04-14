import type { BlockExtended } from '@/blocks/types/custom-block';
import type { EngineState } from '../../engine/engine-state';
import { isVirtualInstance, resolveVirtualInstanceConnection } from './virtual-instances';

export function validateInstanceSelection(
  this: BlockExtended,
  state: EngineState,
  systemId: string,
  fieldName: string,
): void {
  if (!this.workspace || this.isInFlyout) return;

  const selectedName = this.getFieldValue(fieldName);
  if (!selectedName) return;

  if (isVirtualInstance(selectedName)) {
    const resolved = resolveVirtualInstanceConnection(state, selectedName, this.workspace);
    if (resolved !== null) {
      this.setWarningText(null);
    } else {
      this.setWarningText(
        'Virtual instance is no longer valid. Please re-select from the dropdown.',
      );
    }
    return;
  }

  const targetBlockTypes = state.constructorTypes.get(systemId);
  if (!targetBlockTypes) return;

  const blocks = [...targetBlockTypes].flatMap((t) => this.workspace.getBlocksByType(t));
  const exists = blocks.some(
    (block) => block.getFieldValue('CONSTRUCTED_VAR_NAME') === selectedName,
  );

  if (!exists) {
    this.setWarningText(
      `Please change the selection: No "${selectedName}" ${systemId} instance found.`,
    );
  } else {
    this.setWarningText(null);
  }
}
