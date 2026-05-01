import type { JaclyBlocksData } from '@jaculus/project';
import type * as Blockly from 'blockly/core';
import type { EngineState } from '../../engine/engine-state';
import { buildToolboxFromParsedConfigs, parseToolboxConfigs } from './toolbox-processing';

export function loadToolboxConfiguration(
  state: EngineState,
  jaclyBlocksData: JaclyBlocksData,
): Blockly.utils.toolbox.ToolboxDefinition {
  const parsedConfigs = parseToolboxConfigs(jaclyBlocksData);
  return buildToolboxFromParsedConfigs(state, parsedConfigs);
}
