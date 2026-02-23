import * as Blockly from 'blockly/core';
import { Blocks } from 'blockly/core';
import { FieldColour } from '@blockly/field-colour';
import { BlockExtended } from '../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';
import { t } from '../lib/translations';

const DYNAMIC_TYPES = ['NAMES', 'RGB', 'HSL', 'HEX', 'PALETTE'] as const;
const COLOR_NAMES: string[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'light_blue',
  'blue',
  'purple',
  'pink',
  'white',
  'off',
] as const;

interface DynamicColorBlock extends BlockExtended {
  mode_: string;
  updateShape: (mode: string | null) => string | null | undefined;
  addShadowNumber: (inputName: string, defaultValue: number) => void;
  addShadowText: (inputName: string, defaultValue: string) => void;
}

Blocks['dynamic_color_rgb'] = {
  init(this: DynamicColorBlock) {
    this.appendDummyInput()
      .appendField(t('dynamic_color_rgb_message0'))
      .appendField(
        new Blockly.FieldDropdown(
          DYNAMIC_TYPES.map(type => [
            t('dynamic_color_rgb_dropdown_' + type.toLowerCase()),
            type,
          ]),
          this.updateShape.bind(this)
        ),
        'MODE'
      );

    this.setOutput(true, 'Color');
    this.setColour(140);

    this.mode_ = 'NAMES';
    this.updateShape('NAMES');
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

    if (this.mode_ === newMode) return undefined;

    if (this.getInput('NAMES_INPUT')) this.removeInput('NAMES_INPUT');
    if (this.getInput('PALETTE_INPUT')) this.removeInput('PALETTE_INPUT');
    if (this.getInput('R_INPUT')) this.removeInput('R_INPUT');
    if (this.getInput('G_INPUT')) this.removeInput('G_INPUT');
    if (this.getInput('B_INPUT')) this.removeInput('B_INPUT');
    if (this.getInput('H_INPUT')) this.removeInput('H_INPUT');
    if (this.getInput('S_INPUT')) this.removeInput('S_INPUT');
    if (this.getInput('L_INPUT')) this.removeInput('L_INPUT');
    if (this.getInput('HEX_INPUT')) this.removeInput('HEX_INPUT');

    this.mode_ = newMode;

    if (this.mode_ === 'NAMES') {
      this.setInputsInline(true);
      this.appendDummyInput('NAMES_INPUT').appendField(
        new Blockly.FieldDropdown(
          COLOR_NAMES.map(name => [t('dynamic_color_' + name), name])
        ),
        'COLOR_NAME'
      );
    } else if (this.mode_ === 'PALETTE') {
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
      this.appendValueInput('H_INPUT')
        .setCheck('Number')
        .appendField('Hue (0-360)');
      this.appendValueInput('S_INPUT')
        .setCheck('Number')
        .appendField('Saturation (0-100) %');
      this.appendValueInput('L_INPUT')
        .setCheck('Number')
        .appendField('Lightness (0-100) %');

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

  saveExtraState: function (this: DynamicColorBlock) {
    const state: Record<string, string> = { mode: this.mode_ };
    if (this.mode_ === 'NAMES') {
      state.colorName = this.getFieldValue('COLOR_NAME') ?? 'red';
    }
    return state;
  },

  loadExtraState: function (
    this: DynamicColorBlock,
    state: { mode: string; colorName?: string }
  ) {
    this.getField('MODE')?.setValue(state.mode);
    // Reset mode_ to force updateShape to rebuild the inputs
    this.mode_ = '';
    this.updateShape(state.mode);
    if (state.mode === 'NAMES' && state.colorName) {
      this.getField('COLOR_NAME')?.setValue(state.colorName);
    }
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
    case 'NAMES': {
      const colorName = codeBlock.getFieldValue('COLOR_NAME') || 'red';
      code = `colors.${colorName}`;
      break;
    }

    case 'PALETTE': {
      const colorVal = codeBlock.getFieldValue('COLOR_VAL') || '#ffffff';
      code = `colors.hexToRgb("${colorVal}")`;
      break;
    }

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
      code = `colors.rgb(${r}, ${g}, ${b})`;
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
      code = `colors.hslToRgb(${h}, ${s}, ${l})`;
      break;
    }

    case 'HEX': {
      const hex = codeBlock.getInput('HEX_INPUT')
        ? generator.valueToCode(codeBlock, 'HEX_INPUT', Order.NONE) ||
          '"#ffffff"'
        : '"#ffffff"';
      code = `colors.hexToRgb(${hex})`;
      break;
    }

    default:
      code = 'colors.off';
  }

  return [code, Order.NONE];
};
