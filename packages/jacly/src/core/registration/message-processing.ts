import { JaclyBlockKindBlock } from '@/core/schema';

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
