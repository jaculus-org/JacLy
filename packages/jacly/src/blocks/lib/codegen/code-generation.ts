import { JaclyBlock, JaclyBlockKindBlock } from '../../schema';
import { BlockExtended } from '../../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';
import { getPlaceholderValue, replacePlaceholders } from './placeholder-utils';

// Check if all conditions match the current block values
function evaluateConditions(
  conditions: Array<Record<string, string>>,
  args: JaclyBlockKindBlock['args0'],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): boolean {
  if (!conditions || conditions.length === 0) return false;

  return conditions.every(condition => {
    return Object.entries(condition).every(([placeholder, expectedValue]) => {
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

// Pick the right code template based on what's set in the block
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
  }
  return block.code || null;
}

// Set up code generation for a JacLy block
export function registerCodeGenerator(block: JaclyBlock) {
  if (block.kind != 'block' || (!block.code && !block.codeConditionals)) {
    return;
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
