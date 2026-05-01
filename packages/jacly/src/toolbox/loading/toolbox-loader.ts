import type { JaclyBlocksData } from '@jaculus/project';
import type * as Blockly from 'blockly/core';
import { buildCategoryHierarchy } from '@/toolbox/categories/category-hierarchy';
import type { ToolboxItemInfoSort } from '@/toolbox/types';
import type { EngineState } from '../../engine/engine-state';
import { buildToolboxItem, parseToolboxCustomBlock } from './toolbox-item-builder';
import {
  parseToolboxConfigs,
  prepareToolboxConfig,
  registerParsedToolboxBlocks,
} from './toolbox-processing';

export function loadToolboxConfiguration(
  state: EngineState,
  jaclyBlocksData: JaclyBlocksData,
): Blockly.utils.toolbox.ToolboxDefinition {
  const parsedConfigs = parseToolboxConfigs(jaclyBlocksData);
  registerParsedToolboxBlocks(state, parsedConfigs);

  const toolboxContent: ToolboxItemInfoSort[] = [];
  for (const parsedConfig of parsedConfigs) {
    const config = prepareToolboxConfig(state, parsedConfig);
    const toolboxItem = config.contents
      ? buildToolboxItem(state, config)
      : parseToolboxCustomBlock(config);
    toolboxContent.push(toolboxItem);
  }

  return {
    kind: 'categoryToolbox',
    contents: buildCategoryHierarchy(toolboxContent),
  };
}
