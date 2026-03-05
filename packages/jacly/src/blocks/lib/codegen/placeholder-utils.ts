import { JaclyBlockKindBlock } from '../../schema';
import { BlockExtended } from '../../types/custom-block';
import * as Blockly from 'blockly/core';
import { JavascriptGenerator, Order } from 'blockly/javascript';
import {
  isVirtualInstance,
  resolveVirtualInstanceConnection,
} from '../registration/constructors';

export type FieldDropdownWithMenuGenerator = Blockly.FieldDropdown & {
  menuGenerator_?: Blockly.MenuGenerator & (() => Blockly.MenuGenerator);
};

export interface BlockExtraState {
  instanceName?: string;
}

// Get the value to use for a placeholder based on the arg's type
export function getPlaceholderValue(
  arg: NonNullable<JaclyBlockKindBlock['args0']>[number],
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
): string {
  const argName = arg.name;

  switch (arg.type) {
    case 'field_input':
    case 'field_number':
    case 'field_colour':
      return codeBlock.getFieldValue(argName) || '';

    case 'field_dropdown': {
      const rawValue = codeBlock.getFieldValue(argName) || '';
      // If this is a virtual instance, resolve to its connection expression
      if (isVirtualInstance(rawValue)) {
        const resolved = resolveVirtualInstanceConnection(
          rawValue,
          codeBlock.workspace
        );
        if (resolved !== null) return resolved;
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

// Swap in the actual values for all placeholders in the code template
export function replacePlaceholders(
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
