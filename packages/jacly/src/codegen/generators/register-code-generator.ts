import { JaclyBlock, JaclyBlockKindBlock } from '@/schema';
import { BlockExtended } from '@/blocks/types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';
import {
  getPlaceholderValue,
  replacePlaceholders,
} from '@/codegen/placeholders/placeholder-utils';
import type { EngineState } from '../../engine/engine-state';

function evaluateConditions(
  state: EngineState,
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
      const actualValue = getPlaceholderValue(state, arg, codeBlock, generator);
      return actualValue === expectedValue;
    });
  });
}

function selectConditionalCode(
  state: EngineState,
  block: JaclyBlockKindBlock,
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): string | null {
  if (block.codeConditionals && block.codeConditionals.length > 0) {
    for (const conditional of block.codeConditionals) {
      if (
        evaluateConditions(
          state,
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

export function registerCodeGenerator(
  state: EngineState,
  block: JaclyBlock
): void {
  if (block.kind !== 'block' || (!block.code && !block.codeConditionals))
    return;

  jsg.forBlock[block.type] = function (
    codeBlock: BlockExtended,
    generator: JavascriptGenerator
  ) {
    const codeTemplate = selectConditionalCode(
      state,
      block,
      codeBlock,
      generator
    );
    if (!codeTemplate) {
      return block.output ? ['', Order.NONE] : '';
    }

    let code = replacePlaceholders(
      state,
      codeTemplate,
      block.args0,
      codeBlock,
      generator
    );

    if (block.output) {
      return [code, Order.NONE];
    } else {
      if (!block.previousStatement) code += '\n';
      return code;
    }
  };
}
