// Helpers for adding shadow blocks to value inputs

import * as Blockly from 'blockly/core';

function createShadow(
  blockType: string,
  fields: Record<string, string>
): Element {
  const shadow = Blockly.utils.xml.createElement('shadow');
  shadow.setAttribute('type', blockType);
  for (const [name, value] of Object.entries(fields)) {
    const field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', name);
    field.textContent = value;
    shadow.appendChild(field);
  }
  return shadow;
}

export function addShadowNumber(
  block: Blockly.Block,
  inputName: string,
  defaultValue: number
): void {
  const connection = block.getInput(inputName)?.connection;
  if (!connection) return;
  connection.setShadowDom(
    createShadow('math_number', { NUM: String(defaultValue) })
  );
}

export function addShadowText(
  block: Blockly.Block,
  inputName: string,
  defaultValue: string
): void {
  const connection = block.getInput(inputName)?.connection;
  if (!connection) return;
  connection.setShadowDom(createShadow('text', { TEXT: defaultValue }));
}
