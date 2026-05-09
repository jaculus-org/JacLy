import type { EngineState, VirtualInstanceDef } from '../../engine/engine-state';

export type { VirtualInstanceDef };

// systemId is the logical type name (e.g. "motor") — multiple block types can produce the same
// systemId (motor_constructor and robutek2's virtual motor both feed instanceof-"motor" dropdowns)
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

// keyed by block type, not instance name -> survives renames (name resolved at rebuild time)
export function registerVirtualInstances(
  state: EngineState,
  constructorBlockType: string,
  virtualInstances: VirtualInstanceDef[],
): void {
  state.virtualDefsByProviderBlockType.set(constructorBlockType, virtualInstances);
}
