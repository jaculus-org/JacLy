import { JaclyBlock } from '@/config';
import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';

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
    init: function () {
      const blockDef: any = {
        message0: processedMessage,
        args0: args.map(arg => ({
          type: arg.type,
          name: arg.name,
          check: arg.check,
        })),
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
    },
  };

  // Define the code generator
  jsg.forBlock[block.type] = function (block: any, generator: any) {
    if (!block.code)
      throw new Error(`Block of type ${block.type} has no code template.`);
    let code = block.code;

    // Replace $[NAME] with generated code for inputs
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
