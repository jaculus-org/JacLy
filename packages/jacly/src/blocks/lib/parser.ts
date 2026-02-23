import { JaclyConfig } from '../schema';
import { ToolboxItemInfoSort } from '../types/toolbox';
import {
  editInternalBlocks,
  registerBlocklyBlock,
  registerCodeGenerator,
  registryLibraryImport,
} from './blockly';

export function parseToolboxContentsBlock(
  jaclyConfig: JaclyConfig
): ToolboxItemInfoSort {
  for (const item of jaclyConfig.contents!) {
    if (item.kind !== 'block') {
      continue;
    }

    // Only register custom blocks (those that have message0, args0, or code defined)
    // Built-in blocks should not be re-registered as it will overwrite their definitions
    const isCustomBlock =
      item.message0 !== undefined ||
      item.args0 !== undefined ||
      item.code !== undefined;

    registryLibraryImport(item, jaclyConfig);

    if (isCustomBlock) {
      registerBlocklyBlock(item, jaclyConfig);
      registerCodeGenerator(item, jaclyConfig);
    } else {
      editInternalBlocks(item, jaclyConfig);
    }
  }

  if (jaclyConfig.contents) {
    jaclyConfig.contents = jaclyConfig.contents.filter(item => {
      if (item.kind === 'block') {
        return item.hideInToolbox !== true;
      }
      return true;
    });
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
