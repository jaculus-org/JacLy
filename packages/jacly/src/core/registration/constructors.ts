import { BlockExtended, FieldDropdownExtended } from '../types/custom-block';
import * as Blockly from 'blockly/core';
import type { EngineState, VirtualInstanceDef } from '../engine-state';

export type { VirtualInstanceDef };

export function registerConstructorType(
  state: EngineState,
  systemId: string,
  blockType: string
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
  virtualInstances: VirtualInstanceDef[]
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

export function getConstructorMixin(systemId: string) {
  const prefix = systemId + '_';

  return {
    onchange(this: BlockExtended, e: Blockly.Events.BlockChange) {
      if (!this.workspace || this.isInFlyout) return;

      const fieldName = 'CONSTRUCTED_VAR_NAME';
      const currentName = this.getFieldValue(fieldName);

      if (
        e &&
        e.type === Blockly.Events.BLOCK_CHANGE &&
        e.element === 'field' &&
        e.name === fieldName
      ) {
        const newValue = currentName;
        const oldValue = e.oldValue;
        const constructorBlockType = this.type;
        const blocks = this.workspace.getBlocksByType(constructorBlockType);
        const duplicate = blocks.some(
          block =>
            block.id !== this.id && block.getFieldValue(fieldName) === newValue
        );
        if (duplicate) {
          this.setFieldValue(oldValue ?? `${prefix}?`, fieldName);
        }
      }

      if (currentName === `${prefix}?`) {
        const constructorBlockType = this.type;
        const blocks = this.workspace.getBlocksByType(constructorBlockType);
        let maxIndex = -1;
        blocks.forEach(block => {
          const name = block.getFieldValue(fieldName);
          if (name && name.startsWith(prefix)) {
            const suffix = name.slice(prefix.length);
            const index = parseInt(suffix);
            if (!isNaN(index) && index > maxIndex) maxIndex = index;
          }
        });
        this.setFieldValue(prefix + (maxIndex + 1), fieldName);
      }
    },
  };
}

export function getInstanceDropdownGenerator(
  state: EngineState,
  systemId: string
): () => Blockly.MenuGenerator {
  return function (this: FieldDropdownExtended) {
    const options: [string, string][] = [];
    const constructorBlockTypes = state.constructorTypes.get(systemId);

    const sourceBlock = this.getSourceBlock();
    const workspace = sourceBlock
      ? sourceBlock.workspace
      : Blockly.getMainWorkspace();

    if (workspace && constructorBlockTypes) {
      for (const constructorBlockType of constructorBlockTypes) {
        const blocks = workspace.getBlocksByType(constructorBlockType);
        blocks.forEach(block => {
          const instanceName = block.getFieldValue('CONSTRUCTED_VAR_NAME');
          if (instanceName && instanceName !== `${systemId}_?`) {
            options.push([instanceName, instanceName]);
          }
        });
      }
    }

    if (workspace) {
      const providerBlockTypes =
        state.virtualInstancesByType.get(systemId) || [];
      for (const providerType of providerBlockTypes) {
        const viDefs = state.virtualInstances.get(providerType) || [];
        const providerBlocks = workspace.getBlocksByType(providerType);
        for (const block of providerBlocks) {
          const constructorVarName = block.getFieldValue(
            'CONSTRUCTED_VAR_NAME'
          );
          if (!constructorVarName || constructorVarName.endsWith('_?'))
            continue;
          for (const vi of viDefs) {
            if (vi.instanceof === systemId) {
              const label = `${constructorVarName}.${vi.name}`;
              const value = `__vi__${providerType}__${block.id}__${vi.name}`;
              options.push([label, value]);
            }
          }
        }
      }
    }

    const currentValue = this.getValue();
    if (currentValue && currentValue !== 'INVALID') {
      const exists = options.some(opt => opt[1] === currentValue);
      if (!exists) options.push([currentValue, currentValue]);
    }

    if (sourceBlock && sourceBlock.savedInstanceName) {
      const saved = sourceBlock.savedInstanceName;
      const exists = options.some(opt => opt[1] === saved);
      if (!exists && saved !== 'INVALID') options.push([saved, saved]);
    }

    options.sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { numeric: true })
    );

    if (options.length === 0) {
      return [['<Requires init block>', 'INVALID']];
    }

    return options;
  };
}

export function resolveVirtualInstanceConnection(
  state: EngineState,
  selectedValue: string,
  workspace: Blockly.Workspace | null
): string | null {
  const match = selectedValue.match(/^__vi__(.+?)__(.+?)__(.+)$/);
  if (!match) return null;

  const [, constructorBlockType, constructorBlockId, viName] = match;
  const viDefs = state.virtualInstances.get(constructorBlockType);
  if (!viDefs) return null;

  const vi = viDefs.find(v => v.name === viName);
  if (!vi) return null;

  if (!workspace) return null;
  const constructorBlock = workspace.getBlockById(constructorBlockId);
  if (!constructorBlock) return null;

  const constructorVarName = constructorBlock.getFieldValue(
    'CONSTRUCTED_VAR_NAME'
  );
  if (!constructorVarName) return null;

  return vi.connection.replace('$[CONSTRUCTED_VAR_NAME]', constructorVarName);
}

export function isVirtualInstance(selectedValue: string): boolean {
  return selectedValue.startsWith('__vi__');
}

export function validateInstanceSelection(
  this: BlockExtended,
  state: EngineState,
  systemId: string,
  fieldName: string
): void {
  if (!this.workspace || this.isInFlyout) return;

  const selectedName = this.getFieldValue(fieldName);
  if (!selectedName) return;

  if (isVirtualInstance(selectedName)) {
    const resolved = resolveVirtualInstanceConnection(
      state,
      selectedName,
      this.workspace
    );
    if (resolved !== null) {
      this.setWarningText(null);
    } else {
      this.setWarningText(
        'Virtual instance is no longer valid. Please re-select from the dropdown.'
      );
    }
    return;
  }

  const targetBlockTypes = state.constructorTypes.get(systemId);
  if (!targetBlockTypes) return;

  const blocks = [...targetBlockTypes].flatMap(t =>
    this.workspace.getBlocksByType(t)
  );
  const exists = blocks.some(
    block => block.getFieldValue('CONSTRUCTED_VAR_NAME') === selectedName
  );

  if (!exists) {
    this.setWarningText(
      `Please change the selection: No "${selectedName}" ${systemId} instance found.`
    );
  } else {
    this.setWarningText(null);
  }
}
