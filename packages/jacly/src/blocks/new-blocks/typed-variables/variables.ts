/**
 * Custom Variables category for JacLy.
 *
 * The built-in Blockly `variables_get` / `variables_set` blocks do not
 * restrict their `FieldVariable` to a specific type, so they show ALL
 * variables — including constants.  This module overrides those blocks so
 * their dropdowns only show untyped ('') variables, and registers a custom
 * VARIABLE flyout that also omits typed variables.
 *
 * Usage:
 *   Import this module for its side-effects:
 *     import '…/typed-variables/variables';
 *   Then, once the workspace has been injected, call:
 *     registerVariableCategoryCallback(workspace);
 */

import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import { TypedVarConfig, registerTypedVariableCategory } from './utils';
import { addShadowNumber } from '../../lib/shadow-blocks';

// ── Variable type for regular (untyped) variables ────────────────────────────
export const VAR_VAR_TYPE = 'VARIABLE'; // Typed variable, same pattern as CONST
export const VAR_CATEGORY_NAME = 'VARIABLE'; // matches `"custom": "VARIABLE"` in JSON

// ── block type IDs (the standard Blockly names) ──────────────────────────────
const BLOCK_GET = 'variables_get';
const BLOCK_SET = 'variables_set';

// ── Shared config object ─────────────────────────────────────────────────────
export const VAR_CONFIG: TypedVarConfig = {
  varType: VAR_VAR_TYPE,
  blockGet: BLOCK_GET,
  blockSet: BLOCK_SET,
  createButtonLabel: '%{BKY_NEW_VARIABLE}',
  createCallbackKey: 'CREATE_VARIABLE',
};

// ============================================================================
// Override built-in block definitions
//
// We use jsonInit so the message0/args0 pattern is identical to the built-in
// blocks, preserving compatibility with Blockly's serialization.
// The only change is adding `variableTypes` and `defaultType` to the
// field_variable, which restricts dropdowns to type '' (untyped) only.
// ============================================================================

Blockly.Blocks[BLOCK_GET] = {
  init(this: Blockly.Block) {
    this.jsonInit({
      type: BLOCK_GET,
      message0: '%1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
          variableTypes: [VAR_VAR_TYPE],
          defaultType: VAR_VAR_TYPE,
        },
      ],
      output: null,
      style: 'variable_blocks',
      helpUrl: '%{BKY_VARIABLES_GET_HELPURL}',
      tooltip: '%{BKY_VARIABLES_GET_TOOLTIP}',
    });
  },

  // Context-menu: offer to create a matching setter
  customContextMenu(
    this: Blockly.Block,
    options: Array<
      | Blockly.ContextMenuRegistry.ContextMenuOption
      | Blockly.ContextMenuRegistry.LegacyContextMenuOption
    >
  ) {
    if (!this.isInFlyout) {
      const varField = this.getField('VAR')!;
      options.push({
        enabled: this.workspace.remainingCapacity() > 0,
        text: (
          Blockly.Msg['VARIABLES_GET_CREATE_SET'] || 'Create "set %1"'
        ).replace('%1', varField.getText()),
        callback: Blockly.ContextMenu.callbackFactory(this, {
          type: BLOCK_SET,
          fields: { VAR: varField.saveState(true) },
        }),
      });
    }
  },
};

Blockly.Blocks[BLOCK_SET] = {
  init(this: Blockly.Block) {
    this.jsonInit({
      type: BLOCK_SET,
      message0: '%{BKY_VARIABLES_SET}',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
          variableTypes: [VAR_VAR_TYPE],
          defaultType: VAR_VAR_TYPE,
        },
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'variable_blocks',
      tooltip: '%{BKY_VARIABLES_SET_TOOLTIP}',
      helpUrl: '%{BKY_VARIABLES_SET_HELPURL}',
    });

    addShadowNumber(this, 'VALUE', 0);
  },

  // Context-menu: offer to create a matching getter
  customContextMenu(
    this: Blockly.Block,
    options: Array<
      | Blockly.ContextMenuRegistry.ContextMenuOption
      | Blockly.ContextMenuRegistry.LegacyContextMenuOption
    >
  ) {
    if (!this.isInFlyout) {
      const varField = this.getField('VAR')!;
      options.push({
        enabled: this.workspace.remainingCapacity() > 0,
        text: (
          Blockly.Msg['VARIABLES_SET_CREATE_GET'] || 'Create "get %1"'
        ).replace('%1', varField.getText()),
        callback: Blockly.ContextMenu.callbackFactory(this, {
          type: BLOCK_GET,
          fields: { VAR: varField.saveState(true) },
        }),
      });
    }
  },
};

// ============================================================================
// JavaScript code generators (identical to the built-in ones)
// ============================================================================

jsg.forBlock[BLOCK_GET] = function (block: Blockly.Block) {
  const code = jsg.getVariableName(block.getFieldValue('VAR'));
  return [code, Order.ATOMIC];
};

jsg.forBlock[BLOCK_SET] = function (block: Blockly.Block) {
  const argument0 = jsg.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName = jsg.getVariableName(block.getFieldValue('VAR'));
  return `${varName} = ${argument0};\n`;
};

// ============================================================================
// Registration helper
// ============================================================================

/**
 * Register the custom VARIABLE flyout-category callback on the given workspace.
 * Must be called once after the workspace has been injected.
 */
export function registerVariableCategoryCallback(
  workspace: Blockly.WorkspaceSvg
): void {
  registerTypedVariableCategory(workspace, VAR_CONFIG, VAR_CATEGORY_NAME);
}
