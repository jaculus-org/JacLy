import { Blocks } from 'blockly/core';
import { JaclyBlock, JaclyConfig } from '../schema';
import { BlockWithCode } from '../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';

export function registerBlocklyBlock(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
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
    });

    while (argIndex <= block.args0.length) {
      message += ` %${argIndex}`;
      argIndex++;
    }

    block.message0 = message;
  }

  if (jaclyConfig.colour) {
    block.colour = jaclyConfig.colour;
  }
  if (jaclyConfig.style) {
    block.style = jaclyConfig.style;
  }

  // Define the block in Blockly
  Blocks[block.type] = {
    init(this: BlockWithCode) {
      this.jsonInit(block);
      this.code = block.code;
      this.isProgramStart = block.isProgramStart;
    },
  };
}

export function registerCodeGenerator(
  block: JaclyBlock,
  _jaclyConfig: JaclyConfig,
  _libName: string
) {
  if (!block.code) {
    return;
  }

  jsg.forBlock[block.type] = function (
    codeBlock: BlockWithCode,
    generator: JavascriptGenerator
  ) {
    let code = block.code!;

    block.args0?.forEach(arg => {
      const placeholder = `$[${arg.name}]`;
      let replaceValue = '';
      if (code.includes(placeholder)) {
        switch (arg.type) {
          case 'input_value':
            replaceValue =
              generator.valueToCode(codeBlock, arg.name, Order.NONE) || 'null';
            break;
          case 'input_statement':
            replaceValue = generator.statementToCode(codeBlock, arg.name) || '';
            // code = code.replace(placeholder, statementCode);
            break;
          case 'field_dropdown':
          case 'field_variable':
            replaceValue = codeBlock.getFieldValue(arg.name) || '';
            break;
        }
        code = code.replace(placeholder, replaceValue);
      }
    });

    return [code, Order.NONE];
  };
}
