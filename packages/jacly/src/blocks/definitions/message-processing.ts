import type { JaclyBlockKindBlock } from '@/schema';

// JacLy uses named $[ARG_NAME] placeholders; Blockly needs positional %1, %2 etc.
// translates in place. also seeds instanceof dropdowns with a dummy option so Blockly
// doesn't crash before the real menu generator runs.
export function processArgsForRegistration(block: JaclyBlockKindBlock) {
  if (block.args0 && block.args0.length > 0 && block.message0) {
    let argIndex = 1;
    let message = block.message0 ?? '';

    block.args0.forEach((arg) => {
      const placeholder = `$[${arg.name}]`;
      if (message.includes(placeholder)) {
        message = message.replace(placeholder, `%${argIndex}`);
        argIndex++;
      }

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
