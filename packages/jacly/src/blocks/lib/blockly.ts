import { Blocks } from 'blockly/core';
import { JaclyBlock, JaclyBlockKindBlock, JaclyConfig } from '../schema';
import {
  BlockExtended,
  BlockSvgExtended,
  WorkspaceSvgExtended,
} from '../types/custom-block';
import * as Blockly from 'blockly/core';

import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';
import {
  getConstructorMixin,
  getInstanceDropdownGenerator,
  registerConstructorType,
  validateInstanceSelection,
} from './constructors';
import { colourHexaToRgbString } from '@/editor/plugins/field-colour-hsv-sliders';

type FieldDropdownWithMenuGenerator = Blockly.FieldDropdown & {
  menuGenerator_?: Blockly.MenuGenerator & (() => Blockly.MenuGenerator);
};

interface BlockExtraState {
  instanceName?: string;
}

/**
 * Registry mapping block types to their required library imports.
 * Key: block type (e.g., "i2c_setup", "vl53l0x_create")
 * Value: array of import statements
 */
const blockLibraryImports = new Map<string, string[]>();

export function getLibraryImportsForBlock(blockType: string): string[] {
  return blockLibraryImports.get(blockType) || [];
}

export function registerBlocklyBlock(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (block.kind != 'block') {
    return;
  }

  const inputs: JaclyBlockKindBlock['inputs'] = {};

  // add callback variable input slots to the block's first line
  if (
    block.callbackVars &&
    block.callbackVars.length > 0 &&
    block.args0 &&
    block.message0
  ) {
    const varInputArgs = block.callbackVars.map(cbVar => ({
      type: 'input_value' as const,
      name: `CALLBACK_VAR_${cbVar.name}`,
      check: cbVar.type,
    }));

    // insert before the first input_statement
    const stmtIndex = block.args0.findIndex(
      arg => arg.type === 'input_statement'
    );

    if (stmtIndex !== -1) {
      block.args0.splice(stmtIndex, 0, ...varInputArgs);

      // update message0 to include the new inputs on the same line as the header
      const stmtPlaceholder = `$[${block.args0[stmtIndex + varInputArgs.length].name}]`;
      const inputPlaceholders = block.callbackVars
        .map(cbVar => `$[CALLBACK_VAR_${cbVar.name}]`)
        .join(' ');
      block.message0 = block.message0.replace(
        stmtPlaceholder,
        `${inputPlaceholders}\n${stmtPlaceholder}`
      );

      // add callback var getter blocks to inputs
      for (const cbVar of block.callbackVars) {
        const getterType = `${block.type}_${cbVar.name}`;
        inputs[`CALLBACK_VAR_${cbVar.name}`] = {
          block: {
            type: getterType,
          },
        };
      }
    }
  }

  // process message0 to replace $[NAME] with %1, %2, etc.
  if (block.args0 && block.args0.length > 0 && block.message0) {
    let argIndex = 1;
    let message = block.message0 ?? '';

    block.args0.forEach(arg => {
      const placeholder = `$[${arg.name}]`;
      if (message.includes(placeholder)) {
        message = message.replace(placeholder, `%${argIndex}`);
        argIndex++;
      }

      // special handling for instance dropdowns
      if (arg.type === 'field_dropdown' && arg.instanceof && !arg.options) {
        // Dynamically populate options for instance dropdowns
        arg.options = [['<No Init Block>', 'INVALID']];
      }

      // collect inputs for later use
      if (arg.shadow) {
        inputs[arg.name] = {
          shadow: arg.shadow,
        };
      } else if (arg.block) {
        inputs[arg.name] = {
          block: arg.block,
        };
      }
    });

    while (argIndex <= block.args0.length) {
      message += ` %${argIndex}`;
      argIndex++;
    }

    block.message0 = message;
  }

  // attach inputs to the block definition
  if (Object.keys(inputs).length > 0) {
    block.inputs = inputs;
  }

  // apply jaclyConfig properties to the block
  if (jaclyConfig.colour) {
    block.colour = jaclyConfig.colour;
  }
  if (jaclyConfig.style) {
    block.style = jaclyConfig.style;
  }

  if (block.constructs) {
    registerConstructorType(block.constructs, block.type);
  }

  // define the block in Blockly
  Blocks[block.type] = {
    init(this: BlockExtended) {
      this.jsonInit(block);
      this.code = block.code;
      this.isProgramStart = block.isProgramStart;

      // additional custom properties can be initialized here
      if (block.constructs) {
        this.mixin(getConstructorMixin(block.constructs));
      }

      if (block.args0) {
        block.args0.forEach(arg => {
          if (
            arg.type === 'field_dropdown' &&
            arg.instanceof &&
            arg.options &&
            arg.options.length === 1
          ) {
            const systemId = arg.instanceof;
            const fieldName = arg.name;

            const field = this.getField(fieldName);
            if (field && field instanceof Blockly.FieldDropdown) {
              const dropdownField = field as FieldDropdownWithMenuGenerator;
              dropdownField.menuGenerator_ = getInstanceDropdownGenerator(
                systemId
              ) as Blockly.MenuGenerator & (() => Blockly.MenuGenerator);

              // auto-select if exactly one instance exists
              const options = getInstanceDropdownGenerator(systemId).call(
                field
              ) as [string, string][];
              if (options.length === 1 && options[0][1] !== 'INVALID') {
                this.setFieldValue(options[0][1], fieldName);
              }
            }

            const existingOnChange = this.onchange;
            this.onchange = function (
              this: BlockExtended,
              e: Blockly.Events.Abstract
            ) {
              if (existingOnChange) existingOnChange.call(this, e);
              validateInstanceSelection.call(this, systemId, fieldName);
            };

            this.saveExtraState = function () {
              return { instanceName: this.getFieldValue(fieldName) };
            };

            this.loadExtraState = function (state: BlockExtraState) {
              this.savedInstanceName = state.instanceName;
            };
          }
        });
      }
    },
  };

  // register callback variable getter blocks
  if (block.callbackVars) {
    registerCallbackVarGetters(block, jaclyConfig);
  }
}

/**
 * Register getter blocks for callback variables (argument reporters).
 * These blocks use a special extension that enables drag-to-copy behavior:
 * when dragged from the parent block, a copy is created while the original
 * remains attached.
 */
function registerCallbackVarGetters(
  parentBlock: JaclyBlockKindBlock,
  jaclyConfig: JaclyConfig
) {
  void jaclyConfig;
  if (!parentBlock.callbackVars) return;

  for (const cbVar of parentBlock.callbackVars) {
    const getterType = `${parentBlock.type}_${cbVar.name}`;

    // register the block definition as an argument reporter with copy-on-drag
    Blocks[getterType] = {
      init(this: BlockSvgExtended) {
        this.appendDummyInput().appendField(cbVar.name);
        this.setOutput(true, cbVar.type || null);
        this.setColour('#dc143c');
        this.setTooltip(`${cbVar.name} - callback variable (drag to copy)`);
        this.setInputsInline(true);

        // store parent input name for reconnection
        this.callbackVarInputName = `CALLBACK_VAR_${cbVar.name}`;

        // add change listener for drag-to-copy behavior
        this.setOnChange((event: Blockly.Events.Abstract) => {
          if (event.type !== Blockly.Events.BLOCK_MOVE) return;
          const moveEvent = event as Blockly.Events.BlockMove;
          if (moveEvent.blockId !== this.id) return;

          // if we were disconnected from a parent input that expects us
          if (moveEvent.oldParentId && !moveEvent.newParentId) {
            const workspace = this.workspace as WorkspaceSvgExtended;
            const oldParent = workspace.getBlockById(moveEvent.oldParentId);

            if (oldParent && moveEvent.oldInputName) {
              const input = oldParent.getInput(moveEvent.oldInputName);
              if (
                input &&
                input.connection &&
                !input.connection.targetBlock()
              ) {
                // create a new block to fill the slot we just left
                const newBlock = workspace.newBlock(this.type);
                newBlock.callbackVarInputName = this.callbackVarInputName;
                newBlock.initSvg();
                newBlock.render();

                // connect the new block to the parent
                if (newBlock.outputConnection) {
                  input.connection.connect(newBlock.outputConnection);
                }
              }
            }
          }
        });
      },
    };

    // register the code generator
    jsg.forBlock[getterType] = function () {
      return [cbVar.codeName, Order.ATOMIC];
    };
  }
}

/**
 * Get the replacement value for a placeholder based on the argument type.
 */
function getPlaceholderValue(
  arg: NonNullable<JaclyBlockKindBlock['args0']>[number],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): string {
  switch (arg.type) {
    case 'field_input':
    case 'field_number':
    case 'field_dropdown':
    case 'field_colour':
      return codeBlock.getFieldValue(arg.name) || '';

    case 'input_value':
      return generator.valueToCode(codeBlock, arg.name, Order.NONE) || 'null';

    case 'input_statement':
      return generator.statementToCode(codeBlock, arg.name) || '';

    case 'input_dummy':
    case 'input_end_row':
      return '';

    case 'field_colour_hsv_sliders':
      return colourHexaToRgbString(
        codeBlock.getFieldValue(arg.name) || '#ffffff'
      );

    case 'color_field_select':
      return codeBlock.getFieldValue(arg.name) || '#ffffff';
  }
}

/**
 * Replace all placeholders in the code with their corresponding values.
 */
function replacePlaceholders(
  code: string,
  args: JaclyBlockKindBlock['args0'],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): string {
  if (!args) return code;

  args.forEach(arg => {
    const placeholder = `$[${arg.name}]`;
    if (code.includes(placeholder)) {
      const replaceValue = getPlaceholderValue(arg, codeBlock, generator);
      code = code.replaceAll(placeholder, replaceValue);
    }
  });

  return code;
}

/**
 * Evaluate if all conditions in a condition array match the current block values.
 * Each condition is an object with placeholder keys and expected values.
 */
function evaluateConditions(
  conditions: Array<Record<string, string>>,
  args: JaclyBlockKindBlock['args0'],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): boolean {
  if (!conditions || conditions.length === 0) return false;

  return conditions.every(condition => {
    return Object.entries(condition).every(([placeholder, expectedValue]) => {
      // Extract field name from placeholder (e.g., "$[UNIT]" -> "UNIT")
      const match = placeholder.match(/^\$\[(.+)\]$/);
      if (!match) return false;

      const fieldName = match[1];
      const arg = args?.find(a => a.name === fieldName);
      if (!arg) return false;

      const actualValue = getPlaceholderValue(arg, codeBlock, generator);
      return actualValue === expectedValue;
    });
  });
}

/**
 * Select the appropriate code template based on conditionals.
 * Returns the matching conditional's code, or the default block.code if no match.
 */
function selectConditionalCode(
  block: JaclyBlockKindBlock,
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): string | null {
  if (block.codeConditionals && block.codeConditionals.length > 0) {
    for (const conditional of block.codeConditionals) {
      if (
        evaluateConditions(
          conditional.condition,
          block.args0,
          codeBlock,
          generator
        )
      ) {
        return conditional.code;
      }
    }
    return block.code || null;
  }

  return block.code || null;
}

export function registerCodeGenerator(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (block.kind != 'block' || (!block.code && !block.codeConditionals)) {
    return;
  }

  if (jaclyConfig.libraries && jaclyConfig.libraries.length > 0) {
    blockLibraryImports.set(block.type, jaclyConfig.libraries);
  }

  jsg.forBlock[block.type] = function (
    codeBlock: BlockExtended,
    generator: JavascriptGenerator
  ) {
    const codeTemplate = selectConditionalCode(block, codeBlock, generator);
    if (!codeTemplate) {
      return block.output ? ['', Order.NONE] : '';
    }

    let code = replacePlaceholders(
      codeTemplate,
      block.args0,
      codeBlock,
      generator
    );

    if (block.output) {
      return [code, Order.NONE];
    } else {
      if (!block.previousStatement) {
        code += '\n';
      }
      return code;
    }
  };
}

export function registryLibraryImport(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (
    block.kind == 'block' &&
    jaclyConfig.libraries &&
    jaclyConfig.libraries.length > 0
  ) {
    blockLibraryImports.set(block.type, jaclyConfig.libraries);
  }
}

export function editInternalBlocks(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (block.kind !== 'block') {
    return;
  }

  const colour = block.colour ?? jaclyConfig.colour;
  const style = block.style ?? jaclyConfig.style;

  if (colour) {
    block.colour = colour;
  }
  if (style) {
    block.style = style;
  }

  if ((colour || style) && Blocks[block.type]) {
    const originalInit = Blocks[block.type].init;
    Blocks[block.type] = {
      ...Blocks[block.type],
      init(this: BlockExtended) {
        if (originalInit) originalInit.call(this);
        if (colour) this.setColour(colour);
        if (style) this.setStyle(style);
      },
    };
  }
}
