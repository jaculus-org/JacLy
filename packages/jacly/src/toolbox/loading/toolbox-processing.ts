import type { JaclyBlocksData } from '@jaculus/project';
import type * as Blockly from 'blockly/core';
import { z } from 'zod';
import { enrichBlockInputs } from '@/blocks/aliases/enrich-block-inputs';
import { registerAllBlockImports } from '@/blocks/imports/block-imports';
import { type JaclyConfig, JaclyConfigSchema } from '@/schema';
import {
  JaclyBlockLoadError,
  JaclyBlockParseError,
  JaclyInvalidConfigError,
} from '@/toolbox/errors';
import { localizeJaclyConfig, registerTranslations } from '@/toolbox/translations/translations';
import type { ToolboxItemInfoSort } from '@/toolbox/types';
import { clonePlainData } from '@/utils/clone-plain-data';
import type { EngineState } from '../../engine/engine-state';
import { rebuildToolboxWithExamples } from '../categories/examples-toggle';
import { resolveAliases, resolveExamplesAliases } from './alias-resolution';
import { registerFullBlocks } from './block-registration-pass';
import { buildToolboxItem, expandLabels, parseToolboxCustomBlock } from './toolbox-item-builder';

export interface ParsedToolboxConfig {
  fileKey: string;
  config: JaclyConfig;
}

export function parseToolboxConfigs(jaclyBlocksData: JaclyBlocksData): ParsedToolboxConfig[] {
  if (jaclyBlocksData.translations) {
    registerTranslations(jaclyBlocksData.translations);
  }

  const parsedConfigs: ParsedToolboxConfig[] = [];

  for (const fileKey in jaclyBlocksData.blockFiles) {
    const file = jaclyBlocksData.blockFiles[fileKey];
    const result = JaclyConfigSchema.safeParse(file);
    if (!result.success) {
      throw new JaclyBlockParseError(
        `Failed to parse Jacly block file '${fileKey}': ${z.prettifyError(result.error)}`,
      );
    }

    const config = result.data;
    localizeJaclyConfig(config);
    parsedConfigs.push({ fileKey, config });
  }

  return parsedConfigs;
}

export function registerParsedToolboxBlocks(
  state: EngineState,
  parsedConfigs: ParsedToolboxConfig[],
): void {
  for (const { config } of parsedConfigs) {
    if (config.contents) {
      registerFullBlocks(state, config);
    }
    if (config.examples) {
      registerFullBlocks(state, { ...config, contents: config.examples });
    }
  }
}

export function collectParsedBlockTypes(parsedConfigs: ParsedToolboxConfig[]): Set<string> {
  const blockTypes = new Set<string>();

  for (const { config } of parsedConfigs) {
    for (const items of [config.contents, config.examples]) {
      if (!items) continue;
      for (const item of items) {
        if (item.kind === 'block') blockTypes.add(item.type);
      }
    }
  }

  return blockTypes;
}

export function prepareToolboxConfig(
  state: EngineState,
  parsedConfig: ParsedToolboxConfig,
): JaclyConfig {
  const { fileKey, config: originalConfig } = parsedConfig;
  const config = clonePlainData(originalConfig);

  if (!config.contents) {
    if (config.custom) return config;
    throw new JaclyInvalidConfigError(
      `Jacly block file '${fileKey}' must contain either 'contents' or 'custom' field.`,
    );
  }

  try {
    registerAllBlockImports(state, config.contents, config);
    resolveAliases(state, fileKey, config);

    for (const item of config.contents) {
      if (item.kind === 'block') {
        enrichBlockInputs(state, item);
      }
    }

    if (config.examples) {
      resolveExamplesAliases(state, fileKey, config);
      for (const item of config.examples) {
        if (item.kind === 'block') enrichBlockInputs(state, item);
      }
      state.categoryExamplesItems.set(
        config.category,
        expandLabels(config.examples) as ToolboxItemInfoSort[],
      );
    }

    return config;
  } catch (error) {
    if (error instanceof JaclyBlockLoadError || error instanceof JaclyInvalidConfigError) {
      throw error;
    }
    throw new JaclyBlockLoadError(`Failed to load toolbox library '${fileKey}': ${error}`);
  }
}

export function buildToolboxFromParsedConfigs(
  state: EngineState,
  parsedConfigs: ParsedToolboxConfig[],
): Blockly.utils.toolbox.ToolboxDefinition {
  registerParsedToolboxBlocks(state, parsedConfigs);

  const toolboxContent: ToolboxItemInfoSort[] = [];
  for (const parsedConfig of parsedConfigs) {
    const config = prepareToolboxConfig(state, parsedConfig);
    const toolboxItem = config.contents
      ? buildToolboxItem(state, config)
      : parseToolboxCustomBlock(config);
    toolboxContent.push(toolboxItem);
  }

  // Store shallow copies before rebuildToolboxWithExamples mutates them via hierarchy
  state.flatCategoryItems = toolboxContent.map((item) => ({ ...item }));

  return rebuildToolboxWithExamples(state, toolboxContent);
}
