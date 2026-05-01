import type { EngineState, VirtualInstanceDef } from '../../engine/engine-state';

export type { VirtualInstanceDef };

export function registerConstructorType(
  state: EngineState,
  systemId: string,
  blockType: string,
): void {
  const existing = state.constructorBlockTypesBySystem.get(systemId);
  if (existing) {
    existing.add(blockType);
  } else {
    state.constructorBlockTypesBySystem.set(systemId, new Set([blockType]));
  }
}

export function registerVirtualInstances(
  state: EngineState,
  constructorBlockType: string,
  virtualInstances: VirtualInstanceDef[],
): void {
  state.virtualDefsByProviderBlockType.set(constructorBlockType, virtualInstances);
}
