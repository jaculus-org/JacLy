/**
 * Custom Constants category for JacLy.
 *
 * Constants are typed variables with type 'CONST'. Each constant can only be
 * set once – a second `constants_set` block for the same constant triggers a
 * warning on the duplicate.
 *
 * Usage:
 *   Import for side-effects (registers blocks + generators):
 *     import '…/typed-variables/constants';
 *   Then, once the workspace has been injected, call:
 *     registerConstCategoryCallback(workspace);
 */

import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import { TypedVarConfig, registerTypedVariableCategory } from './utils';
import { addShadowNumber } from '../../lib/shadow-blocks';

// ── Constant type identifier ─────────────────────────────────────────────────
export const CONST_VAR_TYPE = 'CONST';
export const CONST_CATEGORY_NAME = 'CONST'; // matches `"custom": "CONST"` in JSON

// ── Block type IDs ───────────────────────────────────────────────────────────
const BLOCK_GET = 'variables_get_const';
const BLOCK_SET = 'variables_set_const';

// ── Shared config object ─────────────────────────────────────────────────────
export const CONST_CONFIG: TypedVarConfig = {
  varType: CONST_VAR_TYPE,
  blockGet: BLOCK_GET,
  blockSet: BLOCK_SET,
  createButtonLabel: '%{BKY_NEW_CONSTANT}',
  createCallbackKey: 'CREATE_CONSTANT',
};

// ============================================================================
// Block definitions (using jsonInit for serialization compatibility)
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
          variable: 'MY_CONST',
          variableTypes: [CONST_VAR_TYPE],
          defaultType: CONST_VAR_TYPE,
        },
      ],
      output: null,
      colour: '#8B0000',
      helpUrl: '%{BKY_CONSTANTS_GET_HELPURL}',
      tooltip: '%{BKY_CONSTANTS_GET_TOOLTIP}',
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
          Blockly.Msg['CONSTANTS_GET_CREATE_SET'] || 'Create "set %1"'
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
      message0: '%{BKY_CONSTANTS_SET}',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variable: 'MY_CONST',
          variableTypes: [CONST_VAR_TYPE],
          defaultType: CONST_VAR_TYPE,
        },
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#8B0000',
      helpUrl: '%{BKY_CONSTANTS_SET_HELPURL}',
      tooltip: '%{BKY_CONSTANTS_SET_TOOLTIP}',
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
          Blockly.Msg['CONSTANTS_SET_CREATE_GET'] || 'Create "get %1"'
        ).replace('%1', varField.getText()),
        callback: Blockly.ContextMenu.callbackFactory(this, {
          type: BLOCK_GET,
          fields: { VAR: varField.saveState(true) },
        }),
      });
    }
  },

  /**
   * After each change in the workspace, check whether another
   * `variables_set_const` already sets the same constant.
   * If so, add a warning to *this* block.
   */
  onchange(this: Blockly.Block) {
    if (
      (this.workspace as Blockly.WorkspaceSvg).isDragging?.() ||
      this.isInFlyout
    )
      return;

    const id = this.getFieldValue('VAR');
    const others = this.workspace
      .getBlocksByType(BLOCK_SET, false)
      .filter(
        (b: Blockly.Block) => b.id !== this.id && b.getFieldValue('VAR') === id
      );

    this.setWarningText(
      others.length > 0
        ? Blockly.Msg['CONSTANTS_SET_DUPLICATE_WARNING'] ||
            'This constant is already set by another block.'
        : null
    );
  },
};

// ============================================================================
// Patch the JS generator so CONST variables are not emitted as `var` at top
//
// Blockly's JavascriptGenerator.init() unconditionally declares every variable
// in the workspace as `var …` regardless of type.  That clashes with the
// `const … = …` produced by the set-block generator below.  We wrap init()
// to remove CONST-typed names from the top-level var declaration.
// ============================================================================

const _originalJsgInit = jsg.init.bind(jsg);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(jsg as any).init = function (workspace: Blockly.Workspace) {
  _originalJsgInit(workspace);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gen = jsg as any;
  const varDecl: string | undefined = gen.definitions_?.['variables'];
  if (!varDecl) return;

  const constVars = workspace
    .getVariableMap()
    .getVariablesOfType(CONST_VAR_TYPE);
  if (constVars.length === 0) return;

  const constNames = new Set(
    constVars.map(v =>
      gen.nameDB_.getName(v.getId(), Blockly.Names.NameType.VARIABLE)
    )
  );

  // varDecl looks like: "var foo, bar, baz;"
  const remaining = varDecl
    .replace(/^var\s+/, '')
    .replace(/;$/, '')
    .split(/,\s*/)
    .filter((name: string) => !constNames.has(name));

  if (remaining.length === 0) {
    delete gen.definitions_['variables'];
  } else {
    gen.definitions_['variables'] = 'var ' + remaining.join(', ') + ';';
  }
};

// ============================================================================
// JavaScript code generators
// ============================================================================

jsg.forBlock[BLOCK_GET] = function (block: Blockly.Block) {
  const code = jsg.getVariableName(block.getFieldValue('VAR'));
  return [code, Order.ATOMIC];
};

jsg.forBlock[BLOCK_SET] = function (block: Blockly.Block) {
  const value = jsg.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName = jsg.getVariableName(block.getFieldValue('VAR'));
  return `const ${varName} = ${value};\n`;
};

// ============================================================================
// Registration helper
// ============================================================================

/**
 * Register the custom CONST flyout-category callback on the given workspace.
 * Must be called once after the workspace has been injected.
 */
export function registerConstCategoryCallback(
  workspace: Blockly.WorkspaceSvg
): void {
  registerTypedVariableCategory(workspace, CONST_CONFIG, CONST_CATEGORY_NAME);
}
