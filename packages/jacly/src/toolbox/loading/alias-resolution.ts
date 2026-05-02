import * as Blockly from 'blockly/core';
import { editInternalBlocks } from '@/blocks/aliases/edit-internal-block';
import type { JaclyConfig } from '@/schema';
import { JaclyBlockLoadError } from '@/toolbox/errors';
import type { EngineState } from '../../engine/engine-state';
import { isFullDefinition } from './block-registration-pass';

export function resolveAliases(
  state: EngineState,
  fileKey: string,
  jaclyConfig: JaclyConfig,
): void {
  for (const item of jaclyConfig.contents!) {
    if (item.kind !== 'block') continue;
    if (!isFullDefinition(item)) {
      editInternalBlocks(state, item, jaclyConfig);
      if (!state.registeredBlockTypes.has(item.type) && !Blockly.Blocks[item.type]) {
        throw new JaclyBlockLoadError(
          `Block type '${item.type}' is referenced as an alias in '${fileKey}' but was not defined in any loaded block file.`,
        );
      }
    }
  }
}

export function resolveExamplesAliases(
  state: EngineState,
  fileKey: string,
  jaclyConfig: JaclyConfig,
): void {
  if (!jaclyConfig.examples) return;
  for (const item of jaclyConfig.examples) {
    if (item.kind !== 'block') continue;
    if (!isFullDefinition(item)) {
      editInternalBlocks(state, item, jaclyConfig);
      if (!state.registeredBlockTypes.has(item.type) && !Blockly.Blocks[item.type]) {
        throw new JaclyBlockLoadError(
          `Block type '${item.type}' is referenced in examples of '${fileKey}' but was not defined in any loaded block file.`,
        );
      }
    }
  }
}
