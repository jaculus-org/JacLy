import { Blocks } from 'blockly/core';
import { JaclyBlock, JaclyBlockKindBlock, JaclyConfig } from '../schema';
import { BlockExtended } from '../types/custom-block';
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

export function registerBlocklyBlock(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (block.kind != 'block') {
    return;
  }

  const inputs: JaclyBlockKindBlock['inputs'] = {};

  // Process message0 to replace $[NAME] with %1, %2, etc.
  if (block.args0 && block.args0.length > 0 && block.message0) {
    let argIndex = 1;
    // Ensure we have a string to work with
    let message = block.message0 ?? '';

    block.args0.forEach(arg => {
      const placeholder = `$[${arg.name}]`;
      if (message.includes(placeholder)) {
        message = message.replace(placeholder, `%${argIndex}`);
        argIndex++;
      }

      // Special handling for instance dropdowns
      if (arg.type === 'field_dropdown' && arg.instanceof && !arg.options) {
        // Dynamically populate options for instance dropdowns
        arg.options = [['<No Init Block>', 'INVALID']];
      }

      // Collect inputs for later use
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

  // Attach inputs to the block definition
  if (Object.keys(inputs).length > 0) {
    block.inputs = inputs;
  }

  // Apply jaclyConfig properties to the block
  if (jaclyConfig.colour) {
    block.colour = jaclyConfig.colour;
  }
  if (jaclyConfig.style) {
    block.style = jaclyConfig.style;
  }

  if (block.constructs) {
    registerConstructorType(block.constructs, block.type);
  }

  // Define the block in Blockly
  Blocks[block.type] = {
    init(this: BlockExtended) {
      this.jsonInit(block);
      this.code = block.code;
      this.isProgramStart = block.isProgramStart;

      // Additional custom properties can be initialized here
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
              // @ts-ignore
              field.menuGenerator_ = getInstanceDropdownGenerator(systemId);
            }

            const existingOnChange = this.onchange;
            this.onchange = function (this: BlockExtended, e: any) {
              if (existingOnChange) existingOnChange.call(this, e);
              validateInstanceSelection.call(this, systemId, fieldName);
            };

            this.saveExtraState = function () {
              return { instanceName: this.getFieldValue(fieldName) };
            };

            this.loadExtraState = function (state: any) {
              this.savedInstanceName = state['instanceName'];
            };
          }
        });
      }
    },
  };
}

export function registerCodeGenerator(
  block: JaclyBlock,
  _jaclyConfig: JaclyConfig,
  _libName: string
) {
  if (block.kind != 'block' || !block.code) {
    return;
  }

  jsg.forBlock[block.type] = function (
    codeBlock: BlockExtended,
    generator: JavascriptGenerator
  ) {
    let code = block.code!;

    block.args0?.forEach(arg => {
      const placeholder = `$[${arg.name}]`;
      let replaceValue = '';
      if (code.includes(placeholder)) {
        switch (arg.type) {
          // Fields - use getFieldValue
          case 'field_input':
          case 'field_number':
          case 'field_dropdown':
          case 'field_colour':
            replaceValue = codeBlock.getFieldValue(arg.name) || '';
            break;
          // Inputs - use valueToCode or statementToCode
          case 'input_value':
            replaceValue =
              generator.valueToCode(codeBlock, arg.name, Order.NONE) || 'null';
            break;
          case 'input_statement':
            replaceValue = generator.statementToCode(codeBlock, arg.name) || '';
            break;

          case 'field_colour_hsv_sliders':
            replaceValue = colourHexaToRgbString(codeBlock.getFieldValue(arg.name) || '#ffffff');
            break;
          case 'color_field_select':
            replaceValue = codeBlock.getFieldValue(arg.name) || '#ffffff';
            break;
        }
        code = code.replace(placeholder, replaceValue);
      }
    });


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
