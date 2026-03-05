import type { JaclyBlockKindBlock } from '../../schema';

// Maps block type to its required static imports
export const blockStaticImports = new Map<string, Set<string>>();

// Processed inputs for each block type (used by editInternalBlocks)
export const blockRegisteredInputs = new Map<
  string,
  JaclyBlockKindBlock['inputs']
>();

// Prevent double-registration in React strict mode
export const registeredBlockTypes = new Set<string>();
export const editedInternalBlockTypes = new Set<string>();

// Clear all registries on reload
export function clearBlockRegistries(): void {
  blockStaticImports.clear();
  blockRegisteredInputs.clear();
  registeredBlockTypes.clear();
  editedInternalBlockTypes.clear();
}
