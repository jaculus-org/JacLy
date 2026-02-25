import { JaclyBlocksData } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { ToolboxItemInfoSort } from '../types/toolbox';
import { JaclyConfigSchema } from '../schema';
import {
  JaclyBlockLoadError,
  JaclyBlockParseError,
  JaclyInvalidConfigError,
} from '../types/errors';
import { z } from 'zod';
import { parseToolboxContentsBlock, parseToolboxCustomBlock } from './parser';
import { localizeJaclyConfig, registerTranslations } from './translations';
import { buildCategoryHeader } from './category-header';

export { registerDocsCallbacks } from './category-header';

export function loadToolboxConfiguration(
  jaclyBlocksData: JaclyBlocksData
): Blockly.utils.toolbox.ToolboxDefinition {
  // register translations before building the toolbox
  if (jaclyBlocksData.translations) {
    registerTranslations(jaclyBlocksData.translations);
  }

  const toolboxContent: ToolboxItemInfoSort[] = [];

  for (const fileKey in jaclyBlocksData.blockFiles) {
    const file = jaclyBlocksData.blockFiles[fileKey];
    try {
      const libToolbox = loadToolboxLibrary(fileKey, file);
      toolboxContent.push(libToolbox);
    } catch (error) {
      throw new JaclyBlockLoadError(
        `Failed to load toolbox library '${fileKey}': ${error}`
      );
    }
  }

  return {
    kind: 'categoryToolbox',
    contents: buildCategoryHierarchy(toolboxContent),
  };
}

function loadToolboxLibrary(
  libName: string,
  fileContent: object
): ToolboxItemInfoSort {
  const result = JaclyConfigSchema.safeParse(fileContent);
  if (!result.success) {
    throw new JaclyBlockParseError(
      `Failed to parse Jacly block file '${libName}': ${z.prettifyError(result.error)}`
    );
  }
  const jaclyConfig = result.data;

  localizeJaclyConfig(jaclyConfig);

  if (jaclyConfig.contents) {
    const categoryHeader = buildCategoryHeader(jaclyConfig);
    const toolboxItem = parseToolboxContentsBlock(jaclyConfig);
    if (categoryHeader.length > 0 && toolboxItem.contents) {
      toolboxItem.contents = [...categoryHeader, ...toolboxItem.contents];
    }
    return toolboxItem;
  } else if (jaclyConfig.custom) {
    return parseToolboxCustomBlock(jaclyConfig);
  } else {
    throw new JaclyInvalidConfigError(
      `Jacly block file '${libName}' must contain either 'contents' or 'custom' field.`
    );
  }
}

/**
 * Build a hierarchical category structure from flat toolbox items.
 * Top-level categories are sorted by priority, subcategories alphabetically by name.
 */
function buildCategoryHierarchy(
  items: ToolboxItemInfoSort[]
): ToolboxItemInfoSort[] {
  const topLevelCategories: ToolboxItemInfoSort[] = [];
  const subcategoriesMap = new Map<string, ToolboxItemInfoSort[]>();
  const categoryIds = new Set<string>();

  // separate top-level categories from subcategories and collect IDs
  for (const item of items) {
    if (item.kind === 'category' && item.parentCategory) {
      // subcategory
      const parentId = item.parentCategory;
      const list = subcategoriesMap.get(parentId);
      if (list) {
        list.push(item);
      } else {
        subcategoriesMap.set(parentId, [item]);
      }
    } else {
      // top-level category
      topLevelCategories.push(item);
      if (item.kind === 'category' && item.category) {
        categoryIds.add(item.category);
      }
    }
  }

  // sort top-level categories by priority
  topLevelCategories.sort((a, b) => {
    const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });

  // attach subcategories and collect orphans
  const orphans: ToolboxItemInfoSort[] = [];

  for (const category of topLevelCategories) {
    if (category.kind === 'category' && category.category) {
      const subs = subcategoriesMap.get(category.category);
      if (subs) {
        // Sort and attach subcategories
        subs.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });
        category.contents = [...(category.contents || []), ...subs];
        subcategoriesMap.delete(category.category);
      }
    }
  }

  // remaining subcategories are orphans
  for (const subs of subcategoriesMap.values()) {
    orphans.push(...subs);
  }

  // fallback category for orphans
  if (orphans.length > 0) {
    orphans.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });

    topLevelCategories.push({
      kind: 'category',
      name: 'Other',
      category: '_fallback',
      colour: '#999999',
      contents: orphans,
      priority: Number.MAX_SAFE_INTEGER,
    });
  }
  return topLevelCategories;
}
