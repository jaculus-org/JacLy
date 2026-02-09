/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Generating JavaScript for procedure blocks.
 */

// Former goog.module ID: Blockly.JavaScript.procedures
// Copied and modified from Blockly's built-in JavaScript generator for procedures.

import { BlockExtended } from '../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';

jsg.forBlock['procedures_defreturn'] = procedures_defreturn;
jsg.forBlock['procedures_defnoreturn'] = procedures_defreturn;

function procedures_defreturn(
  block: BlockExtended,
  generator: JavascriptGenerator
) {
  // Define a procedure with a return value.
  const funcName = generator.getProcedureName(block.getFieldValue('NAME'));
  let xfix1 = '';
  if (generator.STATEMENT_PREFIX) {
    xfix1 += generator.injectId(generator.STATEMENT_PREFIX, block);
  }
  if (generator.STATEMENT_SUFFIX) {
    xfix1 += generator.injectId(generator.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = generator.prefixLines(xfix1, generator.INDENT);
  }
  let loopTrap = '';
  if (generator.INFINITE_LOOP_TRAP) {
    loopTrap = generator.prefixLines(
      generator.injectId(generator.INFINITE_LOOP_TRAP, block),
      generator.INDENT
    );
  }
  let branch = '';
  if (block.getInput('STACK')) {
    // The 'procedures_defreturn' block might not have a STACK input.
    branch = generator.statementToCode(block, 'STACK');
  }
  let returnValue = '';
  if (block.getInput('RETURN')) {
    // The 'procedures_defnoreturn' block (which shares this code)
    // does not have a RETURN input.
    returnValue = generator.valueToCode(block, 'RETURN', Order.NONE) || '';
  }
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = generator.INDENT + 'return ' + returnValue + ';\n';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = generator.getVariableName(variables[i]);
  }
  let code =
    'async function ' + // extended to be async
    funcName +
    '(' +
    args.join(', ') +
    ') {\n' +
    xfix1 +
    loopTrap +
    branch +
    xfix2 +
    returnValue +
    '}';
  code = generator.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  // TODO(#7600): find better approach than casting to any to override
  // CodeGenerator declaring .definitions protected.
  (generator as any).definitions_['%' + funcName] = code;
  return null;
}
