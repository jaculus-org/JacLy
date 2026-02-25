import { JaclyBlock, JaclyConfig } from '../schema';
import { ToolboxItemInfoSort } from '../types/toolbox';
import {
  editInternalBlocks,
  enrichBlockInputs,
  registerBlocklyBlock,
  registerCodeGenerator,
  registryLibraryImport,
} from './blockly';

/**
 * Expand a single label item into multiple label items if its text contains
 * newline characters. Each line becomes its own label with the same web-class.
 */
function expandLabel(
  item: Extract<JaclyBlock, { kind: 'label' }>
): Extract<JaclyBlock, { kind: 'label' }>[] {
  const lines = item.text.split('\n').filter(line => line.length > 0);
  if (lines.length <= 1) return [item];
  return lines.map(line => ({ ...item, text: line }));
}

/**
 * Expand all labels in a contents array that contain \n into multiple labels.
 */
function expandLabels(contents: JaclyBlock[]): JaclyBlock[] {
  const result: JaclyBlock[] = [];
  for (const item of contents) {
    if (item.kind === 'label') {
      result.push(...expandLabel(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

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

  // Post-processing: enrich nested block/shadow references with registered inputs.
  // This must run after all blocks are registered so referenced block types are available.
  for (const item of jaclyConfig.contents!) {
    if (item.kind === 'block') {
      enrichBlockInputs(item);
    }
  }

  if (jaclyConfig.contents) {
    jaclyConfig.contents = jaclyConfig.contents.filter(item => {
      if (item.kind === 'block') {
        return item.hideInToolbox !== true;
      }
      return true;
    });

    // Expand labels that contain \n into multiple consecutive label items
    jaclyConfig.contents = expandLabels(jaclyConfig.contents);
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
