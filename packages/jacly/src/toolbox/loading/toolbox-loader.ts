import { JaclyBlocksData } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { ToolboxItemInfoSort } from '@/toolbox/types';
import { JaclyConfig, JaclyConfigSchema } from '@/schema';
import {
  JaclyBlockLoadError,
  JaclyBlockParseError,
  JaclyInvalidConfigError,
} from '@/toolbox/errors';
import { z } from 'zod';
import { registerAllBlockImports } from '@/blocks/imports/block-imports';
import { buildCategoryHierarchy } from '@/toolbox/categories/category-hierarchy';
import { registerFullBlocks } from './block-registration-pass';
import { resolveAliases } from './alias-resolution';
import {
  buildToolboxItem,
  parseToolboxCustomBlock,
} from './toolbox-item-builder';
import {
  localizeJaclyConfig,
  registerTranslations,
} from '@/toolbox/translations/translations';
import type { EngineState } from '../../engine/engine-state';

export function loadToolboxConfiguration(
  state: EngineState,
  jaclyBlocksData: JaclyBlocksData
): Blockly.utils.toolbox.ToolboxDefinition {
  if (jaclyBlocksData.translations) {
    registerTranslations(jaclyBlocksData.translations);
  }

  const parsedConfigs: Array<{ fileKey: string; config: JaclyConfig }> = [];
  for (const fileKey in jaclyBlocksData.blockFiles) {
    const file = jaclyBlocksData.blockFiles[fileKey];
    const result = JaclyConfigSchema.safeParse(file);
    if (!result.success) {
      throw new JaclyBlockParseError(
        `Failed to parse Jacly block file '${fileKey}': ${z.prettifyError(result.error)}`
      );
    }
    const config = result.data;
    localizeJaclyConfig(config);
    parsedConfigs.push({ fileKey, config });
  }

  // Pass 1: register all full definitions before resolving any aliases.
  for (const { config } of parsedConfigs) {
    if (config.contents) {
      registerFullBlocks(state, config);
    }
  }

  const toolboxContent: ToolboxItemInfoSort[] = [];
  for (const { fileKey, config } of parsedConfigs) {
    try {
      let libToolbox: ToolboxItemInfoSort;
      if (config.contents) {
        registerAllBlockImports(state, config.contents, config);
        resolveAliases(state, fileKey, config);
        libToolbox = buildToolboxItem(state, config);
      } else if (config.custom) {
        libToolbox = parseToolboxCustomBlock(config);
      } else {
        throw new JaclyInvalidConfigError(
          `Jacly block file '${fileKey}' must contain either 'contents' or 'custom' field.`
        );
      }
      toolboxContent.push(libToolbox);
    } catch (error) {
      if (
        error instanceof JaclyBlockLoadError ||
        error instanceof JaclyInvalidConfigError
      ) {
        throw error;
      }
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
