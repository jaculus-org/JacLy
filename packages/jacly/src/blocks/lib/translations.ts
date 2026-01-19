import * as Blockly from 'blockly/core';
import { JaclyBlock, JaclyBlocksArgs, JaclyConfig } from '../schema';

const t = Blockly.utils.parsing.replaceMessageReferences;

/**
 * Registers translations to Blockly.Msg for use with %{BKY_...} message references.
 * This should be called before loading the toolbox so that localizeJaclyConfig works correctly.
 */
export function registerTranslations(
  translations: Record<string, string>
): void {
  Object.assign(Blockly.Msg, translations);
}

/**
 * Localizes a JaclyConfig by replacing all Blockly message references (%{BKY_...})
 * with their translated values.
 */
export function localizeJaclyConfig(config: JaclyConfig): void {
  config.name = t(config.name);
  if (config.colour) config.colour = t(config.colour) as typeof config.colour;
  if (config.description) config.description = t(config.description);

  if (config.contents) {
    for (const item of config.contents) {
      localizeBlockItem(item);
    }
  }
}

function localizeBlockItem(item: JaclyBlock): void {
  switch (item.kind) {
    case 'block':
      localizeBlock(item);
      break;
    case 'category':
      item.name = t(item.name);
      if (item.colour) item.colour = t(item.colour) as typeof item.colour;
      break;
    case 'label':
      item.text = t(item.text);
      break;
    case 'separator':
      break;
  }
}

function localizeBlock(block: Extract<JaclyBlock, { kind: 'block' }>): void {
  if (block.message0) block.message0 = t(block.message0);
  if (block.tooltip) block.tooltip = t(block.tooltip);
  if (block.colour) block.colour = t(block.colour) as typeof block.colour;
  if (block.args0) {
    for (const arg of block.args0) {
      localizeArg(arg);
    }
  }
}

function localizeArg(arg: JaclyBlocksArgs): void {
  switch (arg.type) {
    case 'field_dropdown':
      // translate first element of each tuple (display text)
      if (arg.options) {
        for (const option of arg.options) {
          option[0] = t(option[0]);
        }
      }
      break;
    case 'field_input':
      if (arg.text) arg.text = t(arg.text);
      break;
  }
}
