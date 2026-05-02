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

export function expandLabels(contents: JaclyBlock[]): JaclyBlock[] {
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
  const contents = expandLabels(
    jaclyConfig.contents!.filter((item) => {
      if (item.kind === 'block') return item.hideInToolbox !== true;
      return true;
    }),
  );

  const categoryHeader = buildCategoryHeader(state, jaclyConfig);
  const toolboxItem: ToolboxItemInfoSort = {
    kind: 'category',
    ...jaclyConfig,
    contents,
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
