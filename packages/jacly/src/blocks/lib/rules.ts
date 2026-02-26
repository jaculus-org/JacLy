import * as Blockly from 'blockly/core';
import { Events } from 'blockly/core';
import { BlockSvgExtended, WorkspaceSvgExtended } from '../types/custom-block';

const OUTSIDE_ENTRY_DISABLED_REASON = 'outside_entry_block';

const codeChangeEvents = [
  Events.BLOCK_CREATE,
  Events.BLOCK_DELETE,
  Events.BLOCK_MOVE,
  Events.BLOCK_CHANGE,
];

export function registerWorkspaceChangeListener(
  workspace: WorkspaceSvgExtended
) {
  // Register all listeners
  listenersFunctionsMap.forEach((eventTypes, listenerFunction) => {
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (eventTypes === undefined || eventTypes.includes(event.type)) {
        listenerFunction(workspace, event);
      }
    });
  });
}

// Map of listener functions to their associated event types (or undefined for all events)
const listenersFunctionsMap: Map<
  (workspace: WorkspaceSvgExtended, event?: Blockly.Events.Abstract) => void,
  string[] | undefined
> = new Map([
  [processWorkspaceBlocks, codeChangeEvents],
  [autoCloseToolboxOnCreate, [Events.BLOCK_CREATE]],
]);

export function autoCloseToolboxOnCreate(
  workspace: WorkspaceSvgExtended,
  event?: Blockly.Events.Abstract
) {
  if (!event || event.type !== Events.BLOCK_CREATE) return;
  const toolbox = workspace.getToolbox() as Blockly.Toolbox | null;
  if (!toolbox) return;

  for (const item of toolbox.getToolboxItems()) {
    const collapsible = item as Blockly.CollapsibleToolboxCategory;
    if (
      typeof collapsible.isCollapsible === 'function' &&
      collapsible.isCollapsible()
    ) {
      collapsible.setExpanded(false);
    }
  }

  toolbox.clearSelection();
}

export function processWorkspaceBlocks(workspace: WorkspaceSvgExtended) {
  const blocks = workspace.getAllBlocks(false);

  blocks.forEach(block => {
    applyOutsideEntryRule(block);
  });
}

function applyOutsideEntryRule(block: BlockSvgExtended): void {
  const rootBlock = block.getRootBlock();

  // isProgramStartActive might have name starting procedure definition
  const isProgramStartActive =
    !!rootBlock &&
    (rootBlock?.isProgramStart || rootBlock?.type.startsWith('procedures_'));
  const shouldDisable = !isProgramStartActive;
  const hasReason = block.hasDisabledReason(OUTSIDE_ENTRY_DISABLED_REASON);

  if (shouldDisable && !hasReason) {
    block.setDisabledReason(true, OUTSIDE_ENTRY_DISABLED_REASON);
  } else if (!shouldDisable && hasReason) {
    block.setDisabledReason(false, OUTSIDE_ENTRY_DISABLED_REASON);
  }
}
