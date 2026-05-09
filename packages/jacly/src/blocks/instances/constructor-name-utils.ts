import type * as Blockly from 'blockly/core';
import type { EngineState } from '@/engine/engine-state';

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function getConstructedName(block: Blockly.Block): string {
  return (block.getFieldValue('CONSTRUCTED_VAR_NAME') || '').trim();
}

// _? suffix = unresolved placeholder from the toolbox definition, auto-replaced with next index on first event
export function isPlaceholderConstructedName(name: string): boolean {
  return name.endsWith('_?');
}

export function isValidConstructedName(name: string): boolean {
  return IDENTIFIER_PATTERN.test(name);
}

// placeholder and invalid names are invisible to dropdowns until corrected
export function isUsableConstructedName(name: string): boolean {
  return name.length > 0 && !isPlaceholderConstructedName(name) && isValidConstructedName(name);
}

export function getTrackedConstructorBlockTypes(state: EngineState): Set<string> {
  const blockTypes = new Set<string>();

  for (const constructorBlockTypes of state.constructorBlockTypesBySystem.values()) {
    for (const blockType of constructorBlockTypes) {
      blockTypes.add(blockType);
    }
  }

  return blockTypes;
}

export function getAllConstructorBlocks(
  state: EngineState,
  workspace: Blockly.Workspace,
): Blockly.Block[] {
  const blocks: Blockly.Block[] = [];

  for (const blockType of getTrackedConstructorBlockTypes(state)) {
    for (const block of workspace.getBlocksByType(blockType, false)) {
      if (block.isEnabled()) blocks.push(block);
    }
  }

  return blocks;
}

// scans for highest existing index (motor_0, motor_2 -> returns motor_3). index only goes up, never reused.
export function getNextConstructedName(
  state: EngineState,
  workspace: Blockly.Workspace,
  constructType: string,
): string {
  const prefix = `${constructType}_`;
  let maxIndex = -1;

  const constructorBlockTypes = state.constructorBlockTypesBySystem.get(constructType) || new Set();
  for (const blockType of constructorBlockTypes) {
    for (const block of workspace.getBlocksByType(blockType, false)) {
      if (!block.isEnabled()) continue;

      const name = getConstructedName(block);
      if (!name.startsWith(prefix) || isPlaceholderConstructedName(name)) continue;

      const suffix = name.slice(prefix.length);
      const index = Number.parseInt(suffix, 10);
      if (!Number.isNaN(index) && index > maxIndex) maxIndex = index;
    }
  }

  return `${prefix}${maxIndex + 1}`;
}

export function hasDuplicateConstructedName(
  state: EngineState,
  workspace: Blockly.Workspace,
  name: string,
  ownerBlockId: string,
): boolean {
  if (!name) return false;

  return getAllConstructorBlocks(state, workspace).some(
    (block) => block.id !== ownerBlockId && getConstructedName(block) === name,
  );
}
