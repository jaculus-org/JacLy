import * as Blockly from 'blockly/core';
import { JaclyBlock, JaclyBlocksArgs, JaclyConfig } from '../schema';

/**
 * Registers translations to Blockly.Msg for use with %{BKY_...} message references.
 * This should be called before loading the toolbox so that localizeJaclyConfig works correctly.
 */
export function registerTranslations(
  translations: Record<string, string>
): void {
  Object.assign(Blockly.Msg, translations);
}

export function t(prefix: string, key: string | null = null): string {
  if (key == '%T%' || key == null) {
    key = `%{BKY_${prefix.toUpperCase()}}`;
  }
  return Blockly.utils.parsing.replaceMessageReferences(key);
}

// %<key>% regex
function tRegex(key: string, prefix: string): string {
  const match = key.match(/^%(.*)%$/);
  if (match) {
    const innerKey = match[1];
    return `%{BKY_${prefix.toUpperCase()}_${innerKey}}`;
  }
  return key;
}

/**
 * Localizes a JaclyConfig by replacing all Blockly message references (%{BKY_...})
 * with their translated values.
 */
export function localizeJaclyConfig(config: JaclyConfig): void {
  config.name = t(`${config.category}_name`, config.name);
  if (config.colour)
    config.colour = t(`${config.category}_colour`, config.colour);
  if (config.description)
    config.description = t(
      `${config.category}_description`,
      config.description
    );

  if (config.contents) {
    for (const item of config.contents) {
      localizeBlockItem(config.category, item);
    }
  }
}

function localizeBlockItem(prefix: string, item: JaclyBlock): void {
  switch (item.kind) {
    case 'block':
      localizeBlock(`${item.type}`, item);
      break;
    case 'category':
      item.name = t(`${prefix}_category_name`, item.name);
      if (item.colour)
        item.colour = t(`${prefix}_category_colour`, item.colour);
      break;
    case 'label':
      item.text = tRegex(item.text, `${prefix}_label`);
      break;
    case 'separator':
      break;
  }
}

function localizeBlock(
  prefix: string,
  block: Extract<JaclyBlock, { kind: 'block' }>
): void {
  if (block.message0) block.message0 = t(`${prefix}_message0`, block.message0);
  if (block.tooltip) block.tooltip = t(`${prefix}_tooltip`, block.tooltip);
  if (block.colour) block.colour = t(`${prefix}_colour`, block.colour);
  if (block.args0) {
    for (const arg of block.args0) {
      localizeArg(`${prefix}_args0`, arg);
    }
  }
}

function localizeArg(prefix: string, arg: JaclyBlocksArgs): void {
  switch (arg.type) {
    case 'field_dropdown':
      if (arg.options) {
        for (const option of arg.options) {
          option[0] = tRegex(option[0], `${prefix}_field_dropdown`);
        }
      }
      break;
    case 'field_input':
      if (arg.text) arg.text = t(`${prefix}_field_input`, arg.text);
      break;
  }
}
