/**
 * Shared helpers for attaching shadow blocks to value inputs.
 *
 * These are standalone functions (not block methods) so they can be used from
 * any block definition without coupling to a specific block interface.
 */

import * as Blockly from 'blockly/core';

/**
 * Attach a shadow `math_number` block to an input if it's empty.
 */
export function addShadowNumber(
  block: Blockly.Block,
  inputName: string,
  defaultValue: number
): void {
  const input = block.getInput(inputName);
  if (!input || input.connection?.targetBlock()) return;

  const shadowBlock = block.workspace.newBlock(
    'math_number'
  ) as Blockly.BlockSvg;
  shadowBlock.setShadow(true);
  shadowBlock.setFieldValue(String(defaultValue), 'NUM');
  shadowBlock.initSvg();
  shadowBlock.render();
  input.connection?.connect(shadowBlock.outputConnection!);
}

/**
 * Attach a shadow `text` block to an input if it's empty.
 */
export function addShadowText(
  block: Blockly.Block,
  inputName: string,
  defaultValue: string
): void {
  const input = block.getInput(inputName);
  if (!input || input.connection?.targetBlock()) return;

  const shadowBlock = block.workspace.newBlock('text') as Blockly.BlockSvg;
  shadowBlock.setShadow(true);
  shadowBlock.setFieldValue(defaultValue, 'TEXT');
  shadowBlock.initSvg();
  shadowBlock.render();
  input.connection?.connect(shadowBlock.outputConnection!);
}
