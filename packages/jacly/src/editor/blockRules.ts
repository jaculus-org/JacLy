import type { WorkspaceSvg, BlockSvg } from 'blockly';
import * as Blockly from 'blockly/core';

const OUTSIDE_ENTRY_DISABLED_REASON = 'outside_entry_block';
const DUPLICATE_ON_START_DISABLED_REASON = 'duplicate_basic_onStart';

interface BlockExtended extends BlockSvg {
  isProgramStart?: boolean;
}

/** Apply all block validation rules to keep the workspace consistent. */
export function applyBlockRules(workspace: WorkspaceSvg): void {
  const duplicateOnStartIds = getDuplicateOnStartIds(workspace);
  const blocks = workspace.getAllBlocks(false);

  blocks.forEach(block => {
    applyOutsideEntryRule(block);
    applyDuplicateOnStartRule(block, duplicateOnStartIds);
  });
}

function getDuplicateOnStartIds(workspace: WorkspaceSvg): Set<string> {
  const duplicateIds = new Set<string>();
  const workspaceWithTypeLookup = workspace as WorkspaceSvg & {
    getBlocksByType?: (type: string, ordered: boolean) => BlockSvg[];
  };
  const onStartBlocks =
    workspaceWithTypeLookup.getBlocksByType?.('basic_onStart', false) ?? [];

  if (onStartBlocks.length <= 1) {
    return duplicateIds;
  }

  onStartBlocks.slice(1).forEach(block => duplicateIds.add(block.id));
  return duplicateIds;
}

function applyOutsideEntryRule(block: BlockSvg): void {
  const rootBlock = block.getRootBlock() as BlockExtended;
  const isInsideAllowedEntry = !!rootBlock && rootBlock.isProgramStart;
  const shouldDisable = !isInsideAllowedEntry;
  const hasReason = block.hasDisabledReason(OUTSIDE_ENTRY_DISABLED_REASON);

  if (shouldDisable && !hasReason) {
    block.setDisabledReason(true, OUTSIDE_ENTRY_DISABLED_REASON);
  } else if (!shouldDisable && hasReason) {
    block.setDisabledReason(false, OUTSIDE_ENTRY_DISABLED_REASON);
  }
}

function applyDuplicateOnStartRule(
  block: BlockSvg,
  duplicateOnStartIds: Set<string>
): void {
  const rootBlock = block.getRootBlock();
  const isDuplicateOnStart =
    !!rootBlock && duplicateOnStartIds.has(rootBlock.id);
  const hasReason = block.hasDisabledReason(DUPLICATE_ON_START_DISABLED_REASON);

  if (isDuplicateOnStart && !hasReason) {
    block.setDisabledReason(true, DUPLICATE_ON_START_DISABLED_REASON);
  } else if (!isDuplicateOnStart && hasReason) {
    block.setDisabledReason(false, DUPLICATE_ON_START_DISABLED_REASON);
  }
}

function replaceShadowWithBlock(
  block: BlockSvg,
  inputName: string,
  oldValue: unknown
): void {
  const input = block.getInput(inputName);
  if (!input) return;

  const shadowBlock = input.connection?.targetBlock();
  if (!shadowBlock || !shadowBlock.isShadow()) return;

  const blockType = shadowBlock.type;
  const newBlock = block.workspace.newBlock(blockType);
  newBlock.initSvg();
  newBlock.render();

  // Copy field values from shadow to new block
  shadowBlock.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      const fieldName = field.name;
      if (fieldName) {
        const newField = newBlock.getField(fieldName);
        if (newField) {
          newField.setValue(field.getValue());
          field.setValue(oldValue);
        }
      }
    });
  });

  input.connection?.connect(newBlock.outputConnection!);
}

export function setupShadowReplacementListener(workspace: WorkspaceSvg): void {
  const handledShadows = new Set<string>();
  let isHandling = false;

  workspace.addChangeListener((event: Blockly.Events.Abstract) => {
    // Avoid re-entrancy
    if (isHandling) return;

    try {
      // We only care about user field changes on blocks
      if (event.type !== Blockly.Events.BLOCK_CHANGE) return;

      const changeEvent = event as Blockly.Events.BlockChange;
      // Only field changes (e.g. user edited a shadow's field)
      if (changeEvent.element !== 'field') return;

      const blockId = changeEvent.blockId;
      if (!blockId) return;

      const targetBlock = workspace.getBlockById(blockId);
      if (!targetBlock) return;

      // Only proceed for shadow blocks
      if (!targetBlock.isShadow()) return;

      // Only run once per shadow block
      if (handledShadows.has(blockId)) return;

      // If the value didn't actually change, ignore
      if (changeEvent.oldValue === changeEvent.newValue) return;

      const parent = targetBlock.getParent();
      if (!parent) return;

      // Find input name that connects to this shadow block
      const input = parent.inputList.find(
        i => i.connection?.targetBlock() === targetBlock
      );
      if (!input) return;

      // Replace the shadow with a real block of the same type
      isHandling = true;
      try {
        replaceShadowWithBlock(parent, input.name!, changeEvent.oldValue!);
        handledShadows.add(blockId);
      } finally {
        isHandling = false;
      }
    } catch (err) {
      console.error('Error in shadow replacement listener', err);
    }
  });
}
