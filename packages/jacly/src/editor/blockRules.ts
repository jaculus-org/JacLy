import type { WorkspaceSvg, BlockSvg } from 'blockly';

const ALLOWED_ENTRY_BLOCK_TYPES = new Set(['basic_onStart', 'basic_forever']);
const OUTSIDE_ENTRY_DISABLED_REASON = 'outside_entry_block';
const DUPLICATE_ON_START_DISABLED_REASON = 'duplicate_basic_onStart';

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
  const rootBlock = block.getRootBlock();
  const isInsideAllowedEntry =
    !!rootBlock && ALLOWED_ENTRY_BLOCK_TYPES.has(rootBlock.type);
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
