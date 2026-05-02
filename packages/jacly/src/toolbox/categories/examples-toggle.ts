import type * as Blockly from 'blockly/core';
import { buildCategoryHierarchy } from '@/toolbox/categories/category-hierarchy';
import type { ToolboxItemInfoSort } from '@/toolbox/types';
import type { EngineState } from '../../engine/engine-state';

export const EXAMPLES_CALLBACK_PREFIX = 'jacly_examples_';

export function examplesCallbackKey(category: string): string {
  return `${EXAMPLES_CALLBACK_PREFIX}${category}`;
}

export function rebuildToolboxWithExamples(
  state: EngineState,
  flatItems?: ToolboxItemInfoSort[],
): Blockly.utils.toolbox.ToolboxDefinition {
  const source = flatItems ?? state.flatCategoryItems;

  const withExamples = source.map((item) => {
    if (item.kind !== 'category' || !item.category) return item;
    return {
      ...item,
      contents: buildContentsForCategory(
        state,
        item.category as string,
        (item.contents ?? []) as ToolboxItemInfoSort[],
      ),
    };
  });

  return {
    kind: 'categoryToolbox',
    contents: buildCategoryHierarchy(withExamples),
  };
}

function buildContentsForCategory(
  state: EngineState,
  category: string,
  baseContents: ToolboxItemInfoSort[],
): ToolboxItemInfoSort[] {
  const examplesItems = state.categoryExamplesItems.get(category) ?? [];
  if (examplesItems.length === 0) return baseContents;

  const isExpanded = state.expandedExamples.has(category);
  const callbackKey = examplesCallbackKey(category);
  const blockCount = examplesItems.filter((e) => (e as any).kind === 'block').length;

  const result: ToolboxItemInfoSort[] = [];
  for (const item of baseContents) {
    if ((item as any).callbackkey === callbackKey) {
      result.push({
        ...item,
        text: isExpanded ? '▼ Examples' : `▶ Examples (${blockCount})`,
      } as ToolboxItemInfoSort);
      if (isExpanded) result.push(...examplesItems);
    } else {
      result.push(item);
    }
  }
  return result;
}

export function registerExamplesCallbacks(
  state: EngineState,
  workspace: Blockly.WorkspaceSvg,
): void {
  for (const category of state.categoryExamplesItems.keys()) {
    const callbackKey = examplesCallbackKey(category);
    workspace.registerButtonCallback(callbackKey, (button) => {
      if (state.expandedExamples.has(category)) {
        state.expandedExamples.delete(category);
      } else {
        state.expandedExamples.add(category);
      }

      const ws = button.getTargetWorkspace();
      const toolbox = ws.getToolbox() as Blockly.Toolbox | null;
      if (!toolbox) return;

      const selectedItem = toolbox.getSelectedItem();
      if (!selectedItem) return;

      const baseItem = state.flatCategoryItems.find(
        (item) => item.kind === 'category' && (item as any).category === category,
      );
      if (!baseItem) return;

      const newContents = buildContentsForCategory(
        state,
        category,
        (baseItem.contents ?? []) as ToolboxItemInfoSort[],
      );

      (selectedItem as Blockly.ToolboxCategory).updateFlyoutContents(newContents);
      toolbox.refreshSelection();
    });
  }
}
