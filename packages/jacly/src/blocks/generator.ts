import { JaclyBlock } from '@/config';
import * as Blockly from 'blockly/core';
import { Block } from 'blockly/core';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';

interface BlockWithCode extends Block {
  code?: string;
  isProgramStart?: boolean;
  previousStatement?: string | null;
  nextStatement?: string | null;
}

export async function registerBlocklyJs(
  block: JaclyBlock,
  libColor?: string,
  libStyleName?: string
): Promise<void> {
  // Process message0 to replace $[NAME] with %1, %2, etc.
  let processedMessage = block.message0 || '';
  let argIndex = 1;
  const args = block.args0 || [];

  // Replace $[NAME] placeholders with %1, %2, etc.
  args.forEach(arg => {
    const placeholder = `$[${arg.name}]`;
    if (processedMessage.includes(placeholder)) {
      processedMessage = processedMessage.replace(placeholder, `%${argIndex}`);
      argIndex++;
    }
  });

  // For any remaining args, append %1 %2 etc. to the message
  while (argIndex <= args.length) {
    processedMessage += ` %${argIndex}`;
    argIndex++;
  }

  // Define the Blockly block
  Blockly.Blocks[block.type] = {
    init(this: BlockWithCode) {
      const blockDef: any = {
        message0: processedMessage,
        args0: args.map(arg => {
          const base: any = {
            type: arg.type,
            name: arg.name,
            check: arg.check,
          };
          if (arg.type === 'field_dropdown' && arg.options) {
            base.options = arg.options;
          }
          return base;
        }),
        tooltip: block.tooltip,
      };

      if (libStyleName) {
        blockDef.style = libStyleName;
      } else if (libColor) {
        blockDef.colour = libColor;
      }

      if (block.previousStatement !== undefined) {
        blockDef.previousStatement = block.previousStatement;
      }
      if (block.nextStatement !== undefined) {
        blockDef.nextStatement = block.nextStatement;
      }

      this.jsonInit(blockDef);

      // Store the code template on the block instance (for generator use)
      this.code = block.code;
      this.isProgramStart = block.isProgramStart || false;
    },
  };

  // Define the code generator
  jsg.forBlock[block.type] = function (
    block: BlockWithCode,
    generator: JavascriptGenerator
  ) {
    if (!block.code)
      throw new Error(`Block of type ${block.type} has no code template.`);
    let code = block.code;

    // Replace $[NAME] with generated code for inputs
    // input_dummy: Used for layout purposes without creating a connection point (e.g., for spacing or labels).
    // field_input: A text input field for user-entered strings.
    // field_number: A numeric input field with optional min/max constraints.
    // field_checkbox: A boolean checkbox field.
    // field_colour: A color picker field.
    // field_variable: A dropdown for selecting variables.
    // field_image: An image field (less common).

    args.forEach((arg: any) => {
      const placeholder = `$[${arg.name}]`;
      if (code.includes(placeholder)) {
        if (arg.type === 'input_value') {
          const valueCode = generator.valueToCode(
            block,
            arg.name,
            Order.ATOMIC
          );
          code = code.replace(placeholder, valueCode || 'null');
        } else if (arg.type === 'input_statement') {
          const statementCode = generator.statementToCode(block, arg.name);
          code = code.replace(placeholder, statementCode || '');
        } else if (arg.type === 'field_dropdown') {
          const fieldValue = block.getFieldValue(arg.name);
          code = code.replace(placeholder, fieldValue);
        } else if (arg.type === 'field_variable') {
          const variableName = block.getFieldValue(arg.name);
          code = code.replace(placeholder, variableName);
        }
      }
    });

    // If this block has no previous statement (is a hat/top-level block), return as statement
    // Otherwise, return as code that continues the chain
    if (
      block.previousStatement === null ||
      block.previousStatement === undefined
    ) {
      return code + '\n';
    }
    return code;
  };
}
