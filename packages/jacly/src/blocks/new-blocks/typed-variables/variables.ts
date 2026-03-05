import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import { TypedVarConfig, registerTypedVariableCategory } from './utils';
import { addShadowNumber } from '../../lib/workspace/shadow-blocks';

export const VAR_VAR_TYPE = 'VARIABLE';
export const VAR_CATEGORY_NAME = 'VARIABLE';

const BLOCK_GET = 'variables_get';
const BLOCK_SET = 'variables_set';

export const VAR_CONFIG: TypedVarConfig = {
  varType: VAR_VAR_TYPE,
  blockGet: BLOCK_GET,
  blockSet: BLOCK_SET,
  createButtonLabel: '%{BKY_NEW_VARIABLE}',
  createCallbackKey: 'CREATE_VARIABLE',
};

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

  // reate a matching setter
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

  // create a matching getter
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

const _originalJsgInit = jsg.init.bind(jsg);
jsg.init = function (workspace: Blockly.Workspace) {
  _originalJsgInit(workspace);
  // nameDB_ is initialized in the original init

  // base on blockly core's variable declaration generator
  const defvars = [];
  // Add developer variables (not created or named by the user).
  const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    defvars.push(
      this.nameDB_!.getName(
        devVarList[i],
        Blockly.Names.NameType.DEVELOPER_VARIABLE
      )
    );
  }

  // Add user variables, but only ones that are being used.
  const variables = Blockly.Variables.allUsedVarModels(workspace);
  for (let i = 0; i < variables.length; i++) {
    defvars.push(
      this.nameDB_!.getName(
        variables[i].getId(),
        Blockly.Names.NameType.VARIABLE
      )
    );
  }

  // Declare all of the variables.
  if (defvars.length) {
    this.definitions_['variables'] = 'let ' + defvars.join(', ') + ';';
  }
  this.isInitialized = true;
};

jsg.forBlock[BLOCK_GET] = function (block: Blockly.Block) {
  const code = jsg.getVariableName(block.getFieldValue('VAR'));
  return [code, Order.ATOMIC];
};

jsg.forBlock[BLOCK_SET] = function (block: Blockly.Block) {
  const argument0 = jsg.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName = jsg.getVariableName(block.getFieldValue('VAR'));
  return `${varName} = ${argument0};\n`;
};

export function registerVariableCategoryCallback(
  workspace: Blockly.WorkspaceSvg
): void {
  registerTypedVariableCategory(workspace, VAR_CONFIG, VAR_CATEGORY_NAME);
}
