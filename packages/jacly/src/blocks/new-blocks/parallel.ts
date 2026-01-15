import { BlockExtended } from '../types/custom-block';
import { javascriptGenerator as jsg } from 'blockly/javascript';

jsg.forBlock['run_parallel'] = function(codeBlock: BlockExtended) {
  var tasks: string[] = [];

  var currentBlock = codeBlock.getInputTargetBlock('TASKS');

  while (currentBlock) {
    var generatorFunc = jsg.forBlock[currentBlock.type];

    if (generatorFunc) {
        // FIX 1: Pass 'jsg' as the third argument.
        // The signature is: function(block, generator)
        // .call(thisArg, arg1, arg2)
        var code = generatorFunc.call(currentBlock, currentBlock, jsg);

        // FIX 2: Handle the Union Type (String vs Tuple).
        // TS errors because 'code' might be a tuple [string, number] if a Value block was connected.
        // We ensure we treat it as a string.
        let cleanedCode: string = '';

        if (Array.isArray(code)) {
            // It's a value block returning [code, operator_order]
            cleanedCode = code[0];
        } else if (typeof code === 'string') {
            // It's a standard statement block
            cleanedCode = code;
        }

        if (cleanedCode) {
             var wrapped =
                 `(async () => {\n` +
                 `  ${cleanedCode.trim()}\n` +
                 `})()`;
             tasks.push(wrapped);
        }
    }

    currentBlock = currentBlock.getNextBlock();
  }

  if (tasks.length === 0) return '';

  var arrayContent = tasks.join(',\n');
  return `await Promise.all([\n${arrayContent}\n]);\n`;
};
