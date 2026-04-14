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
  constructorTypes: Map<string, Set<string>>;
  virtualInstances: Map<string, VirtualInstanceDef[]>;
  virtualInstancesByType: Map<string, string[]>;
  docsCallbacks: Map<string, string>;
}

export function createEngineState(): EngineState {
  return {
    registeredBlockTypes: new Set(),
    editedInternalBlockTypes: new Set(),
    blockInputs: new Map(),
    blockImports: new Map(),
    constructorTypes: new Map(),
    virtualInstances: new Map(),
    virtualInstancesByType: new Map(),
    docsCallbacks: new Map(),
  };
}
