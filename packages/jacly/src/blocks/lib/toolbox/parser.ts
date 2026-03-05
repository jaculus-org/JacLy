import { JaclyBlock, JaclyConfig } from '../../schema';
import { ToolboxItemInfoSort } from '../../types/toolbox';
import {
  editInternalBlocks,
  enrichBlockInputs,
  registerBlocklyBlock,
} from '../registration';
import { registerCodeGenerator, registerAllBlockImports } from '../codegen';

// Split a label by newlines so each line is its own label item
function expandLabel(
  item: Extract<JaclyBlock, { kind: 'label' }>
): Extract<JaclyBlock, { kind: 'label' }>[] {
  const lines = item.text.split('\n').filter(line => line.length > 0);
  if (lines.length <= 1) return [item];
  return lines.map(line => ({ ...item, text: line }));
}

// Handle labels with newlines - split them into multiple label items
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
  registerAllBlockImports(jaclyConfig.contents!, jaclyConfig);

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

    if (isCustomBlock) {
      registerBlocklyBlock(item, jaclyConfig);
      registerCodeGenerator(item);
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
