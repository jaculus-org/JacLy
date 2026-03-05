import { BlockExtended, FieldDropdownExtended } from '../../types/custom-block';
import * as Blockly from 'blockly/core';

const constructorTypeMap = new Map<string, string>();

export function registerConstructorType(systemId: string, blockType: string) {
  constructorTypeMap.set(systemId, blockType);
}

export interface VirtualInstanceDef {
  instanceof: string;
  name: string;
  connection: string;
}

const virtualInstancesMap = new Map<string, VirtualInstanceDef[]>();
const virtualInstancesByType = new Map<string, string[]>();

export function clearConstructorRegistries(): void {
  constructorTypeMap.clear();
  virtualInstancesMap.clear();
  virtualInstancesByType.clear();
}

export function registerVirtualInstances(
  constructorBlockType: string,
  virtualInstances: VirtualInstanceDef[]
) {
  virtualInstancesMap.set(constructorBlockType, virtualInstances);
  for (const vi of virtualInstances) {
    const existing = virtualInstancesByType.get(vi.instanceof) || [];
    if (!existing.includes(constructorBlockType)) {
      existing.push(constructorBlockType);
    }
    virtualInstancesByType.set(vi.instanceof, existing);
  }
}

// Get the mixin for constructor blocks (auto-naming with incrementing numbers)
export function getConstructorMixin(systemId: string) {
  const prefix = systemId + '_';

  return {
    onchange(this: BlockExtended, e: Blockly.Events.BlockChange) {
      if (!this.workspace || this.isInFlyout) {
        return;
      }

      const fieldName = 'CONSTRUCTED_VAR_NAME';
      const currentName = this.getFieldValue(fieldName);

      // prevent duplicates by reverting
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

      // auto-assign a unique name
      if (currentName === `${prefix}?`) {
        const constructorBlockType = this.type;
        const blocks = this.workspace.getBlocksByType(constructorBlockType);

        let maxIndex = -1;

        blocks.forEach(block => {
          const name = block.getFieldValue(fieldName);
          if (name && name.startsWith(prefix)) {
            const parts = name.split('_');
            if (parts.length === 2) {
              const index = parseInt(parts[1]);
              if (!isNaN(index) && index > maxIndex) maxIndex = index;
            }
          }
        });

        this.setFieldValue(prefix + (maxIndex + 1), fieldName);
      }
    },
  };
}

export function getInstanceDropdownGenerator(
  systemId: string
): () => Blockly.MenuGenerator {
  return function (this: FieldDropdownExtended) {
    const options: [string, string][] = [];

    const constructorBlockType = constructorTypeMap.get(systemId);

    const sourceBlock = this.getSourceBlock();
    const workspace = sourceBlock
      ? sourceBlock.workspace
      : Blockly.getMainWorkspace();

    if (workspace && constructorBlockType) {
      const blocks = workspace.getBlocksByType(constructorBlockType);

      blocks.forEach(block => {
        const instanceName = block.getFieldValue('CONSTRUCTED_VAR_NAME');
        if (instanceName && instanceName !== `${systemId.toLowerCase()}_?`) {
          options.push([instanceName, instanceName]);
        }
      });
    }

    // include virtual instances from other constructors
    if (workspace) {
      const providerBlockTypes = virtualInstancesByType.get(systemId) || [];
      for (const providerType of providerBlockTypes) {
        const viDefs = virtualInstancesMap.get(providerType) || [];
        const providerBlocks = workspace.getBlocksByType(providerType);

        for (const block of providerBlocks) {
          const constructorVarName = block.getFieldValue(
            'CONSTRUCTED_VAR_NAME'
          );
          if (!constructorVarName || constructorVarName.endsWith('_?')) {
            continue;
          }

          for (const vi of viDefs) {
            if (vi.instanceof === systemId) {
              const label = `${constructorVarName}.${vi.name}`;
              // encode virtual instance info in the value for later resolution
              const value = `__vi__${providerType}__${block.id}__${vi.name}`;
              options.push([label, value]);
            }
          }
        }
      }
    }

    // preserve currently selected value - even if not in the list
    const currentValue = this.getValue();
    if (currentValue && currentValue !== 'INVALID') {
      const exists = options.some(opt => opt[1] === currentValue);
      if (!exists) {
        options.push([currentValue, currentValue]);
      }
    }

    // preserve value being loaded from save file
    if (sourceBlock && sourceBlock.savedInstanceName) {
      const saved = sourceBlock.savedInstanceName;
      const exists = options.some(opt => opt[1] === saved);
      if (!exists && saved !== 'INVALID') {
        options.push([saved, saved]);
      }
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
  selectedValue: string,
  workspace: Blockly.Workspace | null
): string | null {
  const match = selectedValue.match(/^__vi__(.+?)__(.+?)__(.+)$/);
  if (!match) return null;

  const [, constructorBlockType, constructorBlockId, viName] = match;
  const viDefs = virtualInstancesMap.get(constructorBlockType);
  if (!viDefs) return null;

  const vi = viDefs.find(v => v.name === viName);
  if (!vi) return null;

  // look up the constructor block by ID to get its current variable name
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
  systemId: string,
  fieldName: string
) {
  if (!this.workspace || this.isInFlyout) return;

  const selectedName = this.getFieldValue(fieldName);
  if (!selectedName) return;

  // check if it's a virtual instance — validate the constructor block still exists
  if (isVirtualInstance(selectedName)) {
    const resolved = resolveVirtualInstanceConnection(
      selectedName,
      this.workspace
    );
    if (resolved !== null) {
      this.setWarningText(null);
      return;
    } else {
      this.setWarningText(
        `Virtual instance is no longer valid. Please re-select from the dropdown.`
      );
      return;
    }
  }

  const targetBlockType = constructorTypeMap.get(systemId);
  if (!targetBlockType) return;

  const blocks = this.workspace.getBlocksByType(targetBlockType);
  const exists = blocks.some(
    block => block.getFieldValue('CONSTRUCTED_VAR_NAME') === selectedName
  );

  // TODO: translate
  if (!exists) {
    this.setWarningText(
      `Please change the selection: No "${selectedName}" ${systemId} instance found.`
    );
  } else {
    this.setWarningText(null);
  }
}
