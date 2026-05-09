import type * as Blockly from 'blockly/core';
import type { EngineState } from '@/engine/engine-state';
import {
  getConstructedName,
  hasDuplicateConstructedName,
  isUsableConstructedName,
} from './constructor-name-utils';

// point-in-time snapshot, not reactive — call rebuild() before reading after any workspace change.

// stores provider block ID, not name -> renaming the provider propagates automatically
// (resolveVirtualConnection reads the current name from the live block each time)
interface VirtualBinding {
  providerBlockId: string;
  connectionTemplate: string;
}

export interface InstanceTracker {
  rebuild(): void;
  getOptions(systemId: string): string[];
  hasRealInstance(systemId: string, value: string): boolean;
  hasVirtualInstance(systemId: string, value: string): boolean;
  isAmbiguousRealInstance(systemId: string, value: string): boolean;
  isAmbiguousVirtualInstance(systemId: string, value: string): boolean;
  isDuplicateConstructorName(name: string, ownerBlockId: string): boolean;
  resolveVirtualConnection(systemId: string, value: string): string | null;
}

export function createInstanceTracker(
  state: EngineState,
  workspace: Blockly.Workspace,
): InstanceTracker {
  let instanceNamesBySystem = new Map<string, Map<string, string[]>>();
  let virtualBindingsBySystem = new Map<string, Map<string, VirtualBinding[]>>();

  const pushOwner = (ownersByName: Map<string, string[]>, name: string, ownerBlockId: string) => {
    const owners = ownersByName.get(name) || [];
    if (!owners.includes(ownerBlockId)) owners.push(ownerBlockId);
    ownersByName.set(name, owners);
  };

  const pushVirtualBinding = (
    bindingsByLabel: Map<string, VirtualBinding[]>,
    label: string,
    binding: VirtualBinding,
  ) => {
    const bindings = bindingsByLabel.get(label) || [];
    bindings.push(binding);
    bindingsByLabel.set(label, bindings);
  };

  const rebuild = () => {
    instanceNamesBySystem = new Map();
    virtualBindingsBySystem = new Map();

    // owners stored as array (not Set) so duplicates are detectable -> getOptions excludes ambiguous names
    for (const [systemId, constructorBlockTypes] of state.constructorBlockTypesBySystem) {
      const instanceNames = new Map<string, string[]>();

      for (const blockType of constructorBlockTypes) {
        for (const block of workspace.getBlocksByType(blockType, false)) {
          if (!block.isEnabled()) continue;

          const instanceName = getConstructedName(block);
          if (!isUsableConstructedName(instanceName)) continue;

          pushOwner(instanceNames, instanceName, block.id);
        }
      }

      instanceNamesBySystem.set(systemId, instanceNames);
    }

    // virtual instances: label is "robutek2_0.leftMotor" — the dot-path used in generated code
    for (const [providerBlockType, virtualDefs] of state.virtualDefsByProviderBlockType) {
      for (const providerBlock of workspace.getBlocksByType(providerBlockType, false)) {
        if (!providerBlock.isEnabled()) continue;

        const providerInstanceName = getConstructedName(providerBlock);
        if (!isUsableConstructedName(providerInstanceName)) continue;

        for (const virtualDef of virtualDefs) {
          const label = `${providerInstanceName}.${virtualDef.name}`;
          const bindings = virtualBindingsBySystem.get(virtualDef.instanceof) || new Map();

          pushVirtualBinding(bindings, label, {
            providerBlockId: providerBlock.id,
            connectionTemplate: virtualDef.connection,
          });
          virtualBindingsBySystem.set(virtualDef.instanceof, bindings);
        }
      }
    }

    for (const bindingsByLabel of virtualBindingsBySystem.values()) {
      for (const [label, bindings] of bindingsByLabel) {
        if (bindings.length > 1) {
          console.warn(
            `Duplicate virtual instance label "${label}" from provider blocks ` +
              bindings.map((binding) => `"${binding.providerBlockId}"`).join(', '),
          );
        }
      }
    }
  };

  return {
    rebuild,
    getOptions(systemId: string) {
      const options = new Set<string>();

      const instanceNames = instanceNamesBySystem.get(systemId);
      if (instanceNames) {
        for (const [instanceName, owners] of instanceNames) {
          // more than one owner -> name is ambiguous, exclude until user renames one
          if (owners.length === 1) options.add(instanceName);
        }
      }

      const virtualBindings = virtualBindingsBySystem.get(systemId);
      if (virtualBindings) {
        for (const [label, bindings] of virtualBindings) {
          if (bindings.length === 1) options.add(label);
        }
      }

      return Array.from(options).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    },
    hasRealInstance(systemId: string, value: string) {
      return (instanceNamesBySystem.get(systemId)?.get(value)?.length || 0) === 1;
    },
    hasVirtualInstance(systemId: string, value: string) {
      return (virtualBindingsBySystem.get(systemId)?.get(value)?.length || 0) === 1;
    },
    isAmbiguousRealInstance(systemId: string, value: string) {
      return (instanceNamesBySystem.get(systemId)?.get(value)?.length || 0) > 1;
    },
    isAmbiguousVirtualInstance(systemId: string, value: string) {
      return (virtualBindingsBySystem.get(systemId)?.get(value)?.length || 0) > 1;
    },
    isDuplicateConstructorName(name: string, ownerBlockId: string) {
      return hasDuplicateConstructedName(state, workspace, name, ownerBlockId);
    },
    resolveVirtualConnection(systemId: string, value: string) {
      const bindings = virtualBindingsBySystem.get(systemId)?.get(value);
      if (!bindings || bindings.length !== 1) return null;
      const [binding] = bindings;

      const providerBlock = workspace.getBlockById(binding.providerBlockId);
      if (!providerBlock) return null;

      const providerInstanceName = getConstructedName(providerBlock);
      if (!isUsableConstructedName(providerInstanceName)) return null;

      return binding.connectionTemplate.replace('$[CONSTRUCTED_VAR_NAME]', providerInstanceName);
    },
  };
}

export function getInstanceTracker(
  state: EngineState,
  workspace: Blockly.Workspace | null,
): InstanceTracker | null {
  if (!workspace) return null;
  return state.instanceTrackers.get(workspace) || null;
}
