import { JaclyBlockKindBlock } from '@/blocks/schema';

// Convert message placeholders to Blockly format and handle special field cases
export function processArgsForRegistration(block: JaclyBlockKindBlock) {
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
        arg.options = [['<Requires init block>', 'INVALID']];
      }
    });

    while (argIndex <= block.args0.length) {
      message += ` %${argIndex}`;
      argIndex++;
    }
    block.message0 = message;
  }
}
