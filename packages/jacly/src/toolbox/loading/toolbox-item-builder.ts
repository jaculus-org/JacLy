import { enrichBlockInputs } from '@/blocks/aliases/enrich-block-inputs';
import type { JaclyBlock, JaclyConfig } from '@/schema';
import { buildCategoryHeader } from '@/toolbox/categories/category-header';
import type { ToolboxItemInfoSort } from '@/toolbox/types';
import type { EngineState } from '../../engine/engine-state';

function expandLabel(
  item: Extract<JaclyBlock, { kind: 'label' }>,
): Extract<JaclyBlock, { kind: 'label' }>[] {
  const lines = item.text.split('\n').filter((line) => line.length > 0);
  if (lines.length <= 1) return [item];
  return lines.map((line) => ({ ...item, text: line }));
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

export function buildToolboxItem(
  state: EngineState,
  jaclyConfig: JaclyConfig,
): ToolboxItemInfoSort {
  for (const item of jaclyConfig.contents!) {
    if (item.kind === 'block') {
      enrichBlockInputs(state, item);
    }
  }

  jaclyConfig.contents = jaclyConfig.contents!.filter((item) => {
    if (item.kind === 'block') return item.hideInToolbox !== true;
    return true;
  });
  jaclyConfig.contents = expandLabels(jaclyConfig.contents);

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

export function parseToolboxCustomBlock(jaclyConfig: JaclyConfig): ToolboxItemInfoSort {
  return {
    kind: 'category',
    ...jaclyConfig,
  };
}
