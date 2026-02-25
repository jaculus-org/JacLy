/**
 * Shared utilities for typed-variable categories (Variables, Constants, …).
 *
 * Every typed-variable module in this folder should use these helpers so the
 * flyout layout and button-wiring stay consistent.
 */

import * as Blockly from 'blockly/core';

export interface TypedVarConfig {
  /** Blockly variable type string, e.g. '' or 'CONST'. */
  varType: string;
  /** Block type used to read the variable. */
  blockGet: string;
  /** Block type used to write the variable. */
  blockSet: string;
  /** Label on the "create new" button in the flyout. */
  createButtonLabel: string;
  /** Callback key for the create-button (must be unique per workspace). */
  createCallbackKey: string;
}

/**
 * Build the flyout contents for a typed-variable category.
 *
 * Layout:
 *   1. "Create …" button
 *   2. ONE set block (pre-filled with the most recent variable; user can
 *      switch via the dropdown after dragging)
 *   3. One GET block per variable (newest first)
 */
export function buildTypedVariableFlyout(
  workspace: Blockly.WorkspaceSvg,
  config: TypedVarConfig
): Blockly.utils.toolbox.FlyoutItemInfo[] {
  const vars = workspace.getVariableMap().getVariablesOfType(config.varType);

  const createButton: Blockly.utils.toolbox.ButtonInfo = {
    kind: 'button',
    text: config.createButtonLabel,
    callbackkey: config.createCallbackKey,
  };

  if (vars.length === 0) {
    return [createButton];
  }

  // Newest variable is at the end of the list — reverse so it appears first.
  const reversed = [...vars].reverse();
  const newest = reversed[0];

  // Single SET block with the newest variable pre-selected
  const setBlock: Blockly.utils.toolbox.BlockInfo = {
    kind: 'block',
    type: config.blockSet,
    fields: {
      VAR: {
        name: newest.getName(),
        id: newest.getId(),
        type: newest.getType(),
      },
    },
  };

  // One GET block per variable
  const getBlocks: Blockly.utils.toolbox.FlyoutItemInfo[] = reversed.map(
    variable =>
      ({
        kind: 'block',
        type: config.blockGet,
        fields: {
          VAR: {
            name: variable.getName(),
            id: variable.getId(),
            type: variable.getType(),
          },
        },
      }) as Blockly.utils.toolbox.BlockInfo
  );

  return [createButton, setBlock, ...getBlocks];
}

/**
 * Register a toolbox-category callback and its "create variable" button
 * callback on the given workspace.
 *
 * @param workspace  - The workspace to register on.
 * @param config     - Typed-variable config (same object passed to buildTypedVariableFlyout).
 * @param categoryName - Key used in `registerToolboxCategoryCallback` (matches `"custom"` in the JSON).
 */
export function registerTypedVariableCategory(
  workspace: Blockly.WorkspaceSvg,
  config: TypedVarConfig,
  categoryName: string
): void {
  workspace.registerToolboxCategoryCallback(categoryName, ws =>
    buildTypedVariableFlyout(ws, config)
  );

  workspace.registerButtonCallback(config.createCallbackKey, button => {
    Blockly.Variables.createVariableButtonHandler(
      button.getTargetWorkspace(),
      undefined,
      config.varType
    );
  });
}
