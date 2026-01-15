import { ToolboxItemInfo } from '@/editor/types/toolbox';

export type ToolboxItemInfoSort = ToolboxItemInfo & {
  category?: string;
  name?: string;
  priority?: number;
  priorityCategory?: number;
  parentCategory?: string;
  icon?: string;
  contents?: ToolboxItemInfoSort[];
};
