import { JaclyBlock, JaclyConfig } from '../schema';
import { ToolboxItemInfoSort } from '../types/toolbox';
import { registerBlocklyBlock } from '../registration/block-registration';
import { enrichBlockInputs } from '../registration/input-enrichment';
import { editInternalBlocks } from '../registration/internal-blocks';
import { registerCodeGenerator } from '../codegen/code-generation';
import { registerAllBlockImports } from '../codegen/block-imports';
import { buildCategoryHeader } from './category-header';
import { JaclyBlockLoadError } from '../types/errors';
import * as Blockly from 'blockly/core';
import type { EngineState } from '../../engine/engine-state';

function expandLabel(
  item: Extract<JaclyBlock, { kind: 'label' }>
): Extract<JaclyBlock, { kind: 'label' }>[] {
  const lines = item.text.split('\n').filter(line => line.length > 0);
  if (lines.length <= 1) return [item];
  return lines.map(line => ({ ...item, text: line }));
}

function expandLabels(contents: JaclyBlock[]): JaclyBlock[] {
  const result: JaclyBlock[] = [];
  for (const item of contents) {
    if (item.kind === 'label') {
      result.push(...expandLabel(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

function isFullDefinition(
  item: Extract<JaclyBlock, { kind: 'block' }>
): boolean {
  return (
    item.message0 !== undefined ||
    item.args0 !== undefined ||
    item.code !== undefined
  );
}

/**
 * Pass 1 - register all full block definitions from this config into state.
 * Must be called for all configs before buildToolboxFromContents is called.
 */
export function registerFullBlocks(
  state: EngineState,
  jaclyConfig: JaclyConfig
): void {
  if (!jaclyConfig.contents) return;
  for (const item of jaclyConfig.contents) {
    if (item.kind !== 'block') continue;
    if (isFullDefinition(item)) {
      registerBlocklyBlock(state, item, jaclyConfig);
      registerCodeGenerator(state, item);
    }
  }
}

/**
 * Pass 2 - resolve aliases, enrich nested inputs, filter hidden blocks, and
 * build the toolbox item.
 */
export function buildToolboxFromContents(
  state: EngineState,
  fileKey: string,
  jaclyConfig: JaclyConfig
): ToolboxItemInfoSort {
  registerAllBlockImports(state, jaclyConfig.contents!, jaclyConfig);

  for (const item of jaclyConfig.contents!) {
    if (item.kind !== 'block') continue;
    if (!isFullDefinition(item)) {
      editInternalBlocks(state, item, jaclyConfig);
      if (
        !state.registeredBlockTypes.has(item.type) &&
        !Blockly.Blocks[item.type]
      ) {
        throw new JaclyBlockLoadError(
          `Block type '${item.type}' is referenced as an alias in '${fileKey}' but was not defined in any loaded block file.`
        );
      }
    }
  }

  for (const item of jaclyConfig.contents!) {
    if (item.kind === 'block') {
      enrichBlockInputs(state, item);
    }
  }

  if (jaclyConfig.contents) {
    jaclyConfig.contents = jaclyConfig.contents.filter(item => {
      if (item.kind === 'block') return item.hideInToolbox !== true;
      return true;
    });
    jaclyConfig.contents = expandLabels(jaclyConfig.contents);
  }

  const categoryHeader = buildCategoryHeader(state, jaclyConfig);
  const toolboxItem: ToolboxItemInfoSort = {
    kind: 'category',
    ...jaclyConfig,
  };

  if (categoryHeader.length > 0 && toolboxItem.contents) {
    toolboxItem.contents = [...categoryHeader, ...toolboxItem.contents];
  }

  return toolboxItem;
}

export function parseToolboxCustomBlock(
  jaclyConfig: JaclyConfig
): ToolboxItemInfoSort {
  return {
    kind: 'category',
    ...jaclyConfig,
  };
}
