import type * as Blockly from 'blockly/core';
import type { EngineState } from '../../engine/engine-state';

export function resolveVirtualInstanceConnection(
  state: EngineState,
  selectedValue: string,
  workspace: Blockly.Workspace | null,
): string | null {
  const match = selectedValue.match(/^__vi__(.+?)__(.+?)__(.+)$/);
  if (!match) return null;

  const [, constructorBlockType, constructorBlockId, viName] = match;
  const viDefs = state.virtualInstances.get(constructorBlockType);
  if (!viDefs) return null;

  const vi = viDefs.find((v) => v.name === viName);
  if (!vi) return null;

  if (!workspace) return null;
  const constructorBlock = workspace.getBlockById(constructorBlockId);
  if (!constructorBlock) return null;

  const constructorVarName = constructorBlock.getFieldValue('CONSTRUCTED_VAR_NAME');
  if (!constructorVarName) return null;

  return vi.connection.replace('$[CONSTRUCTED_VAR_NAME]', constructorVarName);
}

export function isVirtualInstance(selectedValue: string): boolean {
  return selectedValue.startsWith('__vi__');
}
