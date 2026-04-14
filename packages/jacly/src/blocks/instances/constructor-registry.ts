import type { EngineState, VirtualInstanceDef } from '../../engine/engine-state';

export type { VirtualInstanceDef };

export function registerConstructorType(
  state: EngineState,
  systemId: string,
  blockType: string,
): void {
  const existing = state.constructorTypes.get(systemId);
  if (existing) {
    existing.add(blockType);
  } else {
    state.constructorTypes.set(systemId, new Set([blockType]));
  }
}

export function registerVirtualInstances(
  state: EngineState,
  constructorBlockType: string,
  virtualInstances: VirtualInstanceDef[],
): void {
  state.virtualInstances.set(constructorBlockType, virtualInstances);
  for (const vi of virtualInstances) {
    const existing = state.virtualInstancesByType.get(vi.instanceof) || [];
    if (!existing.includes(constructorBlockType)) {
      existing.push(constructorBlockType);
    }
    state.virtualInstancesByType.set(vi.instanceof, existing);
  }
}
