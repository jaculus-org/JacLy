import { JaclyBlocksFiles } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { ToolboxInfo } from '@/editor/types/toolbox';
import { ToolboxItemInfoSort } from '../types/toolbox';
import { JaclyConfigSchema } from '../schema';
import {
  JaclyBlockLoadError,
  JaclyBlockParseError,
  JaclyInvalidConfigError,
} from '../types/errors';
import { z } from 'zod';
import { parseToolboxContentsBlock, parseToolboxCustomBlock } from './parser';
// import { registerNvsBlock } from './advanced-blocks/nvs';

export function loadToolboxConfiguration(
  jaclyBlockFiles: JaclyBlocksFiles
): Blockly.utils.toolbox.ToolboxDefinition {
  let toolbox: ToolboxInfo = {
    kind: 'categoryToolbox',
    contents: [],
  };

  const toolboxContent: ToolboxItemInfoSort[] = [];
  for (const fileKey in jaclyBlockFiles) {
    const file = jaclyBlockFiles[fileKey];
    try {
      const libToolbox = loadToolboxLibrary(fileKey, file);
      toolboxContent.push(libToolbox);
    } catch (error) {
      throw new JaclyBlockLoadError(
        `Failed to load toolbox library '${fileKey}': ${error}`
      );
    }
  }

  // toolboxContent.push(registerNvsBlock());

  toolbox.contents = sortToolboxItems(toolboxContent);
  return toolbox;
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

  if (jaclyConfig.contents) {
    return parseToolboxContentsBlock(jaclyConfig, libName);
  } else if (jaclyConfig.custom) {
    return parseToolboxCustomBlock(jaclyConfig);
  } else {
    throw new JaclyInvalidConfigError(
      `Jacly block file '${libName}' must contain either 'contents' or 'custom' field.`
    );
  }
}

function sortToolboxItems(items: ToolboxItemInfoSort[]): ToolboxItemInfoSort[] {
  return items.sort((a, b) => {
    const categoryA = a.categoryIndex ?? Number.MAX_SAFE_INTEGER;
    const categoryB = b.categoryIndex ?? Number.MAX_SAFE_INTEGER;
    if (categoryA !== categoryB) {
      return categoryA - categoryB;
    }

    const underCategoryA = a.underCategoryIndex ?? Number.MAX_SAFE_INTEGER;
    const underCategoryB = b.underCategoryIndex ?? Number.MAX_SAFE_INTEGER;
    return underCategoryA - underCategoryB;
  });
}
