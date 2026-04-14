import { FieldAngle, type FieldAngleConfig, Mode, registerFieldAngle } from '@blockly/field-angle';
import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import type { BlockExtended } from '@/blocks/types/custom-block';

registerFieldAngle();

const config: FieldAngleConfig = {
  min: -180,
  max: 180,
  precision: 15,
  displayMin: -180,
  displayMax: 180,
  clockwise: false,
  mode: Mode.COMPASS,
  offset: -90,
};

Blockly.Blocks.jacly_field_angle = {
  init(this: BlockExtended) {
    this.appendDummyInput()
      .appendField('angle: ')
      .appendField(new FieldAngle(0, undefined, config), 'ANGLE');
    this.setOutput(true, 'Number');
    this.setColour(230);
  },
};

jsg.forBlock.jacly_field_angle = (codeBlock: BlockExtended) => {
  const angle = codeBlock.getFieldValue('ANGLE');
  const code = angle.toString();

  return [code, Order.NONE];
};
