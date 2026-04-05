import { JaclyBlock, JaclyConfig } from '../schema';
import { ToolboxItemInfoSort } from '../types/toolbox';
import {
  editInternalBlocks,
  enrichBlockInputs,
  registerBlocklyBlock,
} from '../registration/block-registration';
import { registerCodeGenerator } from '../codegen/code-generation';
import { registerAllBlockImports } from '../codegen/block-imports';
import { buildCategoryHeader } from './category-header';
import type { EngineState } from '../engine-state';

function expandLabel(
  item: Extract<JaclyBlock, { kind: 'label' }>
): Extract<JaclyBlock, { kind: 'label' }>[] {
  const lines = item.text.split('\n').filter(line => line.length > 0);
  if (lines.length <= 1) return [item];
  return lines.map(line => ({ ...item, text: line }));
}

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
  state: EngineState,
  jaclyConfig: JaclyConfig
): ToolboxItemInfoSort {
  registerAllBlockImports(state, jaclyConfig.contents!, jaclyConfig);

  for (const item of jaclyConfig.contents!) {
    if (item.kind !== 'block') continue;

    const isCustomBlock =
      item.message0 !== undefined ||
      item.args0 !== undefined ||
      item.code !== undefined;

    if (isCustomBlock) {
      registerBlocklyBlock(state, item, jaclyConfig);
      registerCodeGenerator(state, item);
    } else {
      editInternalBlocks(state, item, jaclyConfig);
    }
  }

  for (const item of jaclyConfig.contents!) {
    if (item.kind === 'block') {
      enrichBlockInputs(state, item);
    }
  }

  if (jaclyConfig.contents) {
    jaclyConfig.contents = jaclyConfig.contents.filter(item => {
      if (item.kind === 'block') return item.hideInToolbox !== true;
      return true;
    });
    jaclyConfig.contents = expandLabels(jaclyConfig.contents);
  }

  const categoryHeader = buildCategoryHeader(state, jaclyConfig);
  const toolboxItem: ToolboxItemInfoSort = {
    kind: 'category',
    ...jaclyConfig,
  };

  if (categoryHeader.length > 0 && toolboxItem.contents) {
    toolboxItem.contents = [...categoryHeader, ...toolboxItem.contents];
  }

  return toolboxItem;
}

export function parseToolboxCustomBlock(
  jaclyConfig: JaclyConfig
): ToolboxItemInfoSort {
  return {
    kind: 'category',
    ...jaclyConfig,
  };
}
