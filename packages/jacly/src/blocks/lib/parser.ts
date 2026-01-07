import { JaclyConfig } from '../schema';
import { ToolboxItemInfoSort } from '../types/toolbox';
import { registerBlocklyBlock, registerCodeGenerator } from './blockly';

export function parseToolboxContentsBlock(
  jaclyConfig: JaclyConfig,
  libName: string
): ToolboxItemInfoSort {
  for (const item of jaclyConfig.contents!) {
    // Only register custom blocks (those that have message0, args0, or code defined)
    // Built-in blocks should not be re-registered as it will overwrite their definitions
    const isCustomBlock =
      item.message0 !== undefined ||
      item.args0 !== undefined ||
      item.code !== undefined;

    if (isCustomBlock) {
      registerBlocklyBlock(item, jaclyConfig);
      registerCodeGenerator(item, jaclyConfig, libName);
    }
  }

  return {
    kind: 'category',
    ...jaclyConfig,
  };
}

export function parseToolboxCustomBlock(
  jaclyConfig: JaclyConfig
): ToolboxItemInfoSort {
  return {
    kind: 'category',
    ...jaclyConfig,
  };
}
