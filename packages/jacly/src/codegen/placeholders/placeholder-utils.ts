import type * as Blockly from 'blockly/core';
import { type JavascriptGenerator, Order } from 'blockly/javascript';
import { getInstanceTracker } from '@/blocks/instances/constructors';
import type { BlockExtended } from '@/blocks/types/custom-block';
import type { JaclyBlockKindBlock } from '@/schema';
import type { EngineState } from '../../engine/engine-state';

export type FieldDropdownWithMenuGenerator = Blockly.FieldDropdown & {
  menuGenerator_?: Blockly.MenuGenerator & (() => Blockly.MenuGenerator);
};

export interface BlockExtraState {
  instanceName?: string;
  instanceNames?: Record<string, string>;
}

export function getPlaceholderValue(
  state: EngineState,
  arg: NonNullable<JaclyBlockKindBlock['args0']>[number],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator,
): string {
  const argName = arg.name;

  switch (arg.type) {
    case 'field_input':
    case 'field_number':
    case 'field_colour':
      return codeBlock.getFieldValue(argName) || '';

    case 'field_dropdown': {
      const rawValue = codeBlock.getFieldValue(argName) || '';
      if (arg.instanceof) {
        const tracker = getInstanceTracker(state, codeBlock.workspace);
        const resolved = tracker?.resolveVirtualConnection(arg.instanceof, rawValue);
        if (resolved !== null && resolved !== undefined) return resolved;
      }
      return rawValue;
    }

    case 'input_value':
      return generator.valueToCode(codeBlock, argName, Order.NONE) || 'null';

    case 'input_statement':
      return generator.statementToCode(codeBlock, argName) || '';

    case 'input_dummy':
    case 'input_end_row':
      return '';

    case 'color_field_select':
      return codeBlock.getFieldValue(argName) || '#ffffff';
  }
}

export function replacePlaceholders(
  state: EngineState,
  code: string,
  args: JaclyBlockKindBlock['args0'],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator,
): string {
  if (!args) return code;

  args.forEach((arg) => {
    const placeholder = `$[${arg.name}]`;
    if (code.includes(placeholder)) {
      const replaceValue = getPlaceholderValue(state, arg, codeBlock, generator);
      code = code.replaceAll(placeholder, replaceValue);
    }
  });

  return code;
}
