/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Generating JavaScript for loop blocks.
 */

// Former goog.module ID: Blockly.JavaScript.loops
// Copied and modified from Blockly's built-in JavaScript generator for loops.

import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** Interface for blocks that have the controls_flow_in_loop_check mixin */
interface ControlFlowInLoopBlock extends Block {
  getSurroundLoop(): Block | null;
}

// Helper to check if a string is a number
function isNumber(str: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(str);
}

/** The sleep(0) call to yield control back to the event loop
 * this command is called after each loop iteration
 * to keep the rest of the application responsive
 */
const YIELD_STATEMENT = '  await sleep(0);\n';

jsg.forBlock['controls_repeat_ext'] = function (
  block: Block,
  generator: JavascriptGenerator
) {
  // Repeat n times.
  let repeats;
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats = generator.valueToCode(block, 'TIMES', Order.ASSIGNMENT) || '0';
  }
  let branch = generator.statementToCode(block, 'DO');
  branch = generator.addLoopTrap(branch, block);
  let code = '';
  const loopVar = generator.nameDB_!.getDistinctName('count', 'VARIABLE');
  let endVar = repeats;
  if (!repeats.match(/^\w+$/) && !isNumber(repeats)) {
    endVar = generator.nameDB_!.getDistinctName('repeat_end', 'VARIABLE');
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code +=
    'for (var ' +
    loopVar +
    ' = 0; ' +
    loopVar +
    ' < ' +
    endVar +
    '; ' +
    loopVar +
    '++) {\n' +
    branch +
    YIELD_STATEMENT +
    '}\n';
  return code;
};

jsg.forBlock['controls_repeat'] = jsg.forBlock['controls_repeat_ext'];

jsg.forBlock['controls_whileUntil'] = function (
  block: Block,
  generator: JavascriptGenerator
) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 =
    generator.valueToCode(
      block,
      'BOOL',
      until ? Order.LOGICAL_NOT : Order.NONE
    ) || 'false';
  let branch = generator.statementToCode(block, 'DO');
  branch = generator.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + YIELD_STATEMENT + '}\n';
};

export function controls_for(block: Block, generator: JavascriptGenerator) {
  // For loop.
  const variable0 = generator.getVariableName(block.getFieldValue('VAR'));
  const argument0 =
    generator.valueToCode(block, 'FROM', Order.ASSIGNMENT) || '0';
  const argument1 = generator.valueToCode(block, 'TO', Order.ASSIGNMENT) || '0';
  const increment = generator.valueToCode(block, 'BY', Order.ASSIGNMENT) || '1';
  let branch = generator.statementToCode(block, 'DO');
  branch = generator.addLoopTrap(branch, block);
  let code;
  if (isNumber(argument0) && isNumber(argument1) && isNumber(increment)) {
    // All arguments are simple numbers.
    const up = Number(argument0) <= Number(argument1);
    code =
      'for (' +
      variable0 +
      ' = ' +
      argument0 +
      '; ' +
      variable0 +
      (up ? ' <= ' : ' >= ') +
      argument1 +
      '; ' +
      variable0;
    const step = Math.abs(Number(increment));
    if (step === 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch + YIELD_STATEMENT + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    let startVar = argument0;
    if (!argument0.match(/^\w+$/) && !isNumber(argument0)) {
      startVar = generator.nameDB_!.getDistinctName(
        variable0 + '_start',
        'VARIABLE'
      );
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    let endVar = argument1;
    if (!argument1.match(/^\w+$/) && !isNumber(argument1)) {
      endVar = generator.nameDB_!.getDistinctName(
        variable0 + '_end',
        'VARIABLE'
      );
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    const incVar = generator.nameDB_!.getDistinctName(
      variable0 + '_inc',
      'VARIABLE'
    );
    code += 'var ' + incVar + ' = ';
    if (isNumber(increment)) {
      code += Math.abs(Number(increment)) + ';\n';
    } else {
      code += 'Math.abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += generator.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code +=
      'for (' +
      variable0 +
      ' = ' +
      startVar +
      '; ' +
      incVar +
      ' >= 0 ? ' +
      variable0 +
      ' <= ' +
      endVar +
      ' : ' +
      variable0 +
      ' >= ' +
      endVar +
      '; ' +
      variable0 +
      ' += ' +
      incVar +
      ') {\n' +
      branch +
      YIELD_STATEMENT +
      '}\n';
  }
  return code;
}

export function controls_forEach(block: Block, generator: JavascriptGenerator) {
  // For each loop.
  const variable0 = generator.getVariableName(block.getFieldValue('VAR'));
  const argument0 =
    generator.valueToCode(block, 'LIST', Order.ASSIGNMENT) || '[]';
  let branch = generator.statementToCode(block, 'DO');
  branch = generator.addLoopTrap(branch, block);
  let code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  let listVar = argument0;
  if (!argument0.match(/^\w+$/)) {
    listVar = generator.nameDB_!.getDistinctName(
      variable0 + '_list',
      'VARIABLE'
    );
    code += 'var ' + listVar + ' = ' + argument0 + ';\n';
  }
  const indexVar = generator.nameDB_!.getDistinctName(
    variable0 + '_index',
    'VARIABLE'
  );
  branch =
    generator.INDENT +
    variable0 +
    ' = ' +
    listVar +
    '[' +
    indexVar +
    '];\n' +
    branch;
  code +=
    'for (var ' +
    indexVar +
    ' in ' +
    listVar +
    ') {\n' +
    branch +
    YIELD_STATEMENT +
    '}\n';
  return code;
}

export function controls_flow_statements(
  block: Block,
  generator: JavascriptGenerator
) {
  // Flow statements: continue, break.
  let xfix = '';
  if (generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += generator.injectId(generator.STATEMENT_PREFIX, block);
  }
  if (generator.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += generator.injectId(generator.STATEMENT_SUFFIX, block);
  }
  if (generator.STATEMENT_PREFIX) {
    const loop = (block as ControlFlowInLoopBlock).getSurroundLoop();
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += generator.injectId(generator.STATEMENT_PREFIX, loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break;\n';
    case 'CONTINUE':
      return xfix + 'continue;\n';
  }
  throw Error('Unknown flow statement.');
}
