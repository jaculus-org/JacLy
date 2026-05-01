import type { JaclyBlocksData } from '@jaculus/project';
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
import type { EngineState } from '../../engine/engine-state';
import { resolveAliases } from './alias-resolution';
import { registerFullBlocks } from './block-registration-pass';

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
  }
}

export function prepareToolboxConfig(
  state: EngineState,
  parsedConfig: ParsedToolboxConfig,
): JaclyConfig {
  const { fileKey, config } = parsedConfig;

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

    return config;
  } catch (error) {
    if (error instanceof JaclyBlockLoadError || error instanceof JaclyInvalidConfigError) {
      throw error;
    }
    throw new JaclyBlockLoadError(`Failed to load toolbox library '${fileKey}': ${error}`);
  }
}
