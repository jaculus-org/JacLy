import type * as Blockly from 'blockly/core';

export type ToolboxItemInfo = Blockly.utils.toolbox.ToolboxItemInfo;

export type ToolboxItemInfoSort = ToolboxItemInfo & {
  category?: string;
  name?: string;
  priority?: number;
  priorityCategory?: number;
  parentCategory?: string;
  icon?: string;
  contents?: ToolboxItemInfoSort[];
};
