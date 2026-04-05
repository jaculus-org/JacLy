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
import {
  parseToolboxContentsBlock,
  parseToolboxCustomBlock,
} from './block-pipeline';
import { localizeJaclyConfig, registerTranslations } from './translations';
import type { EngineState } from '../engine-state';

export function loadToolboxConfiguration(
  state: EngineState,
  jaclyBlocksData: JaclyBlocksData
): Blockly.utils.toolbox.ToolboxDefinition {
  if (jaclyBlocksData.translations) {
    registerTranslations(jaclyBlocksData.translations);
  }

  const toolboxContent: ToolboxItemInfoSort[] = [];

  for (const fileKey in jaclyBlocksData.blockFiles) {
    const file = jaclyBlocksData.blockFiles[fileKey];
    try {
      const libToolbox = loadToolboxLibrary(state, fileKey, file);
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
  state: EngineState,
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
    return parseToolboxContentsBlock(state, jaclyConfig);
  } else if (jaclyConfig.custom) {
    return parseToolboxCustomBlock(jaclyConfig);
  } else {
    throw new JaclyInvalidConfigError(
      `Jacly block file '${libName}' must contain either 'contents' or 'custom' field.`
    );
  }
}

function buildCategoryHierarchy(
  items: ToolboxItemInfoSort[]
): ToolboxItemInfoSort[] {
  const topLevelCategories: ToolboxItemInfoSort[] = [];
  const subcategoriesMap = new Map<string, ToolboxItemInfoSort[]>();

  for (const item of items) {
    if (item.kind === 'category' && item.parentCategory) {
      const parentId = item.parentCategory;
      const list = subcategoriesMap.get(parentId);
      if (list) {
        list.push(item);
      } else {
        subcategoriesMap.set(parentId, [item]);
      }
    } else {
      topLevelCategories.push(item);
    }
  }

  topLevelCategories.sort((a, b) => {
    const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });

  const orphans: ToolboxItemInfoSort[] = [];

  for (const category of topLevelCategories) {
    if (category.kind === 'category' && category.category) {
      const subs = subcategoriesMap.get(category.category);
      if (subs) {
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

  for (const subs of subcategoriesMap.values()) {
    orphans.push(...subs);
  }

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
