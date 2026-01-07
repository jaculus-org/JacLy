import { ToolboxItemInfo } from '@/editor/types/toolbox';

export type ToolboxItemInfoSort = ToolboxItemInfo & {
  categoryIndex?: number;
  underCategoryIndex?: number;
};
