import { BlockExtended } from '../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
  Order,
} from 'blockly/javascript';

import { FieldSlider } from '@blockly/field-slider';
import { Blocks, FieldNumber } from 'blockly/core';

// default slider configuration
const DEFAULT_SLIDER_MIN = 0;
const DEFAULT_SLIDER_MAX = 100;
const DEFAULT_SLIDER_STEP = 1;
const DEFAULT_SLIDER_VALUE = 0;

interface DynamicSliderBlock extends BlockExtended {
  SLIDER_MIN: number;
  SLIDER_MAX: number;
  SLIDER_STEP: number;
  SLIDER_VALUE: number;
}

Blocks['jacly_field_slider'] = {
  init: function (this: DynamicSliderBlock) {
    // add hidden configuration fields - these can be set via toolbox shadow block definitions
    this.appendDummyInput('CONFIG_INPUT')
      .appendField(new FieldNumber(DEFAULT_SLIDER_MIN), 'SLIDER_MIN')
      .appendField(new FieldNumber(DEFAULT_SLIDER_MAX), 'SLIDER_MAX')
      .appendField(new FieldNumber(DEFAULT_SLIDER_STEP), 'SLIDER_STEP');

    // hide the config input
    this.getInput('CONFIG_INPUT')?.setVisible(false);

    // create slider with defaults initially
    this.appendDummyInput('SLIDER_INPUT')
      .appendField('slider: ')
      .appendField(
        new FieldSlider(
          DEFAULT_SLIDER_VALUE,
          DEFAULT_SLIDER_MIN,
          DEFAULT_SLIDER_MAX,
          DEFAULT_SLIDER_STEP
        ),
        'VALUE'
      );
    this.setOutput(true, 'Number');
    this.setColour(230);

    // defer reading config values until after blockly has set field values from toolbox
    setTimeout(() => {
      const min =
        Number(this.getFieldValue('SLIDER_MIN')) || DEFAULT_SLIDER_MIN;
      const max =
        Number(this.getFieldValue('SLIDER_MAX')) || DEFAULT_SLIDER_MAX;
      const step =
        Number(this.getFieldValue('SLIDER_STEP')) || DEFAULT_SLIDER_STEP;
      const currentValue =
        Number(this.getFieldValue('VALUE')) || DEFAULT_SLIDER_VALUE;

      // only rebuild if config differs from defaults
      if (
        min !== DEFAULT_SLIDER_MIN ||
        max !== DEFAULT_SLIDER_MAX ||
        step !== DEFAULT_SLIDER_STEP
      ) {
        if (this.getInput('SLIDER_INPUT')) {
          this.removeInput('SLIDER_INPUT');
        }
        this.appendDummyInput('SLIDER_INPUT')
          .appendField('slider: ')
          .appendField(new FieldSlider(currentValue, min, max, step), 'VALUE');
      }
    }, 0);
  },
};

jsg.forBlock['jacly_field_slider'] = function (
  codeBlock: BlockExtended,
  _generator: JavascriptGenerator
) {
  const sliderValue = codeBlock.getFieldValue('VALUE');
  const code = sliderValue.toString();

  return [code, Order.NONE];
};
