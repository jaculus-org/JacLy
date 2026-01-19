import * as Blockly from 'blockly/core';
import { Blocks } from 'blockly/core';
import { FieldColour } from '@blockly/field-colour';
import { BlockExtended } from '../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';
import { colourHexaToRgbString } from '@/editor/plugins/field-colour-hsv-sliders';

interface DynamicColorBlock extends BlockExtended {
  mode_: string;
  updateShape: (mode: string | null) => string | null | undefined;
  addShadowNumber: (inputName: string, defaultValue: number) => void;
  addShadowText: (inputName: string, defaultValue: string) => void;
}

Blocks['dynamic_color_rgb'] = {
  init(this: DynamicColorBlock) {
    this.appendDummyInput()
      .appendField('color')
      .appendField(
        new Blockly.FieldDropdown(
          [
            ['Palette', 'PALETTE'],
            ['RGB', 'RGB'],
            ['HSL', 'HSL'],
            ['Hex', 'HEX'],
          ],
          this.updateShape.bind(this)
        ),
        'MODE'
      );

    this.setOutput(true, 'ColorRGB');
    this.setColour(140);

    this.mode_ = 'PALETTE';
    this.updateShape('PALETTE');
    this.setInputsInline(true);
  },

  /**
   * Updates the block inputs based on the selected mode.
   */
  updateShape: function (
    this: DynamicColorBlock,
    mode: string | null
  ): string | null | undefined {
    const newMode =
      typeof mode === 'string' ? mode : this.getFieldValue('MODE');

    if (this.mode_ === newMode && this.getInput('PALETTE_INPUT'))
      return undefined;

    if (this.getInput('PALETTE_INPUT')) this.removeInput('PALETTE_INPUT');
    if (this.getInput('R_INPUT')) this.removeInput('R_INPUT');
    if (this.getInput('G_INPUT')) this.removeInput('G_INPUT');
    if (this.getInput('B_INPUT')) this.removeInput('B_INPUT');
    if (this.getInput('H_INPUT')) this.removeInput('H_INPUT');
    if (this.getInput('S_INPUT')) this.removeInput('S_INPUT');
    if (this.getInput('L_INPUT')) this.removeInput('L_INPUT');
    if (this.getInput('HEX_INPUT')) this.removeInput('HEX_INPUT');

    this.mode_ = newMode;

    if (this.mode_ === 'PALETTE') {
      this.setInputsInline(true);
      this.appendDummyInput('PALETTE_INPUT').appendField(
        new FieldColour('#ff0000'),
        'COLOR_VAL'
      );
    } else if (this.mode_ === 'RGB') {
      this.setInputsInline(false);
      this.appendValueInput('R_INPUT').setCheck('Number').appendField('R');
      this.appendValueInput('G_INPUT').setCheck('Number').appendField('G');
      this.appendValueInput('B_INPUT').setCheck('Number').appendField('B');

      // Add shadow blocks for empty inputs
      this.addShadowNumber('R_INPUT', 0);
      this.addShadowNumber('G_INPUT', 0);
      this.addShadowNumber('B_INPUT', 0);
    } else if (this.mode_ === 'HSL') {
      this.setInputsInline(false);
      this.appendValueInput('H_INPUT').setCheck('Number').appendField('Hue');
      this.appendValueInput('S_INPUT')
        .setCheck('Number')
        .appendField('Saturation');
      this.appendValueInput('L_INPUT')
        .setCheck('Number')
        .appendField('Lightness');

      // Add shadow blocks for empty inputs
      this.addShadowNumber('H_INPUT', 0);
      this.addShadowNumber('S_INPUT', 100);
      this.addShadowNumber('L_INPUT', 50);
    } else if (this.mode_ === 'HEX') {
      this.setInputsInline(true);
      this.appendValueInput('HEX_INPUT').setCheck('String').appendField('Hex');

      // Add shadow block for empty input
      this.addShadowText('HEX_INPUT', '#ff0000');
    }

    return undefined;
  },

  saveExtraState: function () {
    return {
      mode: this.mode_,
    };
  },

  loadExtraState: function (state: { mode: string }) {
    this.getField('MODE').setValue(state.mode);
    // Reset mode_ to force updateShape to rebuild the inputs
    this.mode_ = '';
    this.updateShape(state.mode);
  },

  /**
   * Adds a shadow number block to an input if it's empty.
   */
  addShadowNumber: function (
    this: DynamicColorBlock,
    inputName: string,
    defaultValue: number
  ) {
    const input = this.getInput(inputName);
    if (!input || input.connection?.targetBlock()) return;

    const shadowBlock = this.workspace.newBlock(
      'math_number'
    ) as Blockly.BlockSvg;
    shadowBlock.setShadow(true);
    shadowBlock.setFieldValue(String(defaultValue), 'NUM');
    shadowBlock.initSvg();
    shadowBlock.render();
    input.connection?.connect(shadowBlock.outputConnection!);
  },

  /**
   * Adds a shadow text block to an input if it's empty.
   */
  addShadowText: function (
    this: DynamicColorBlock,
    inputName: string,
    defaultValue: string
  ) {
    const input = this.getInput(inputName);
    if (!input || input.connection?.targetBlock()) return;

    const shadowBlock = this.workspace.newBlock('text') as Blockly.BlockSvg;
    shadowBlock.setShadow(true);
    shadowBlock.setFieldValue(defaultValue, 'TEXT');
    shadowBlock.initSvg();
    shadowBlock.render();
    input.connection?.connect(shadowBlock.outputConnection!);
  },
};

jsg.forBlock['dynamic_color_rgb'] = function (
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
) {
  const mode = codeBlock.getFieldValue('MODE');
  let code = '';

  switch (mode) {
    case 'PALETTE':
      const colorVal = codeBlock.getFieldValue('COLOR_VAL') || '#ffffff';
      code = colourHexaToRgbString(colorVal);
      break;

    case 'RGB': {
      const r = codeBlock.getInput('R_INPUT')
        ? generator.valueToCode(codeBlock, 'R_INPUT', Order.NONE) || '0'
        : '0';
      const g = codeBlock.getInput('G_INPUT')
        ? generator.valueToCode(codeBlock, 'G_INPUT', Order.NONE) || '0'
        : '0';
      const b = codeBlock.getInput('B_INPUT')
        ? generator.valueToCode(codeBlock, 'B_INPUT', Order.NONE) || '0'
        : '0';
      code = `{ r: ${r}, g: ${g}, b: ${b} }`;
      break;
    }

    case 'HSL': {
      const h = codeBlock.getInput('H_INPUT')
        ? generator.valueToCode(codeBlock, 'H_INPUT', Order.NONE) || '0'
        : '0';
      const s = codeBlock.getInput('S_INPUT')
        ? generator.valueToCode(codeBlock, 'S_INPUT', Order.NONE) || '0'
        : '0';
      const l = codeBlock.getInput('L_INPUT')
        ? generator.valueToCode(codeBlock, 'L_INPUT', Order.NONE) || '0'
        : '0';
      code = `colour.hsl_to_rgb({ h: ${h}, s: ${s}, l: ${l} })`;
      break;
    }

    case 'HEX': {
      const hex = codeBlock.getInput('HEX_INPUT')
        ? generator.valueToCode(codeBlock, 'HEX_INPUT', Order.NONE) ||
          '"#ffffff"'
        : '"#ffffff"';
      code = colourHexaToRgbString(hex.replace(/['"]/g, ''));
      break;
    }

    default:
      code = colourHexaToRgbString('#ffffff');
  }

  return [code, Order.NONE];
};
