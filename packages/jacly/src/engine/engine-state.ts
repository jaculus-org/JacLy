import type * as Blockly from 'blockly/core';
import type { InstanceTracker } from '@/blocks/instances/instance-tracker';
import type { JaclyBlockKindBlock } from '@/schema';

export interface VirtualInstanceDef {
  instanceof: string;
  name: string;
  connection: string;
}

export interface EngineState {
  registeredBlockTypes: Set<string>;
  editedInternalBlockTypes: Set<string>;
  blockInputs: Map<string, JaclyBlockKindBlock['inputs']>;
  blockImports: Map<string, Set<string>>;
  constructorBlockTypesBySystem: Map<string, Set<string>>;
  virtualDefsByProviderBlockType: Map<string, VirtualInstanceDef[]>;
  instanceTrackers: WeakMap<Blockly.Workspace, InstanceTracker>;
  docsCallbacks: Map<string, string>;
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
  };
}

export function resetEngineState(state: EngineState): void {
  resetEngineStateCollections(state);
}
