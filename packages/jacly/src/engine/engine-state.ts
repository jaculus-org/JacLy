import type * as Blockly from 'blockly/core';
import type { InstanceTracker } from '@/blocks/instances/instance-tracker';
import type { JaclyBlockKindBlock } from '@/schema';
import type { ToolboxItemInfoSort } from '@/toolbox/types';

export interface VirtualInstanceDef {
  instanceof: string;
  name: string;
  connection: string;
}

export interface EngineState {
  registeredBlockTypes: Set<string>;
  // separate from registeredBlockTypes — color patch from alias usage is a one-time global
  // mutation on Blockly.Blocks, not tied to full registration
  editedInternalBlockTypes: Set<string>;
  // default shadow/input definitions per block type, merged into alias occurrences
  blockInputs: Map<string, JaclyBlockKindBlock['inputs']>;
  // import lines emitted at the top of generated code, keyed by block type
  blockImports: Map<string, Set<string>>;
  constructorBlockTypesBySystem: Map<string, Set<string>>;
  virtualDefsByProviderBlockType: Map<string, VirtualInstanceDef[]>;
  // WeakMap -> entries are GC'd when a workspace is destroyed
  instanceTrackers: WeakMap<Blockly.Workspace, InstanceTracker>;
  // docs button URLs, registered as workspace callbacks on attach
  docsCallbacks: Map<string, string>;
  expandedExamples: Set<string>;
  categoryExamplesItems: Map<string, ToolboxItemInfoSort[]>;
  // snapshot before hierarchy/examples mutation; used as stable base for the examples toggle
  flatCategoryItems: ToolboxItemInfoSort[];
}

function resetEngineStateCollections(state: EngineState): void {
  state.registeredBlockTypes.clear();
  state.editedInternalBlockTypes.clear();
  state.blockInputs.clear();
  state.blockImports.clear();
  state.constructorBlockTypesBySystem.clear();
  state.virtualDefsByProviderBlockType.clear();
  state.instanceTrackers = new WeakMap();
  state.docsCallbacks.clear();
  state.expandedExamples.clear();
  state.categoryExamplesItems.clear();
  state.flatCategoryItems.length = 0;
}

export function createEngineState(): EngineState {
  return {
    registeredBlockTypes: new Set(),
    editedInternalBlockTypes: new Set(),
    blockInputs: new Map(),
    blockImports: new Map(),
    constructorBlockTypesBySystem: new Map(),
    virtualDefsByProviderBlockType: new Map(),
    instanceTrackers: new WeakMap(),
    docsCallbacks: new Map(),
    expandedExamples: new Set(),
    categoryExamplesItems: new Map(),
    flatCategoryItems: [],
  };
}

export function resetEngineState(state: EngineState): void {
  resetEngineStateCollections(state);
}
