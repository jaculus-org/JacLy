// Helpers for adding shadow blocks to value inputs

import * as Blockly from 'blockly/core';

// Attach a default number shadow block if the input is empty
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

// Attach a default text shadow block if the input is empty
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
