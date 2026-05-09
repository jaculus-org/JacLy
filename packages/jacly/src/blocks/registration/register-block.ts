import * as Blockly from 'blockly/core';
import { Blocks } from 'blockly/core';
import { processArgsForRegistration } from '@/blocks/definitions/message-processing';
import { processInputsForRegistration } from '@/blocks/definitions/shadow-extraction';
import {
  registerCallbackVarGetters,
  registerCallbackVarSlots,
} from '@/blocks/instances/callback-vars';
import {
  getConstructorMixin,
  getInstanceDropdownGenerator,
  registerConstructorType,
  registerVirtualInstances,
  validateInstanceSelection,
} from '@/blocks/instances/constructors';
import type { BlockExtended } from '@/blocks/types/custom-block';
import type {
  BlockExtraState,
  FieldDropdownWithMenuGenerator,
} from '@/codegen/placeholders/placeholder-utils';
import type { JaclyBlock, JaclyBlockKindBlock, JaclyConfig } from '@/schema';
import type { EngineState } from '../../engine/engine-state';

export function registerBlocklyBlock(
  state: EngineState,
  block: JaclyBlock,
  jaclyConfig: JaclyConfig,
): void {
  if (block.kind !== 'block') return;

  if (state.registeredBlockTypes.has(block.type)) return;
  state.registeredBlockTypes.add(block.type);

  const inputs: JaclyBlockKindBlock['inputs'] = {};
  registerCallbackVarSlots(block, inputs);

  processArgsForRegistration(block);

  processInputsForRegistration(block, inputs);
  block.inputs = { ...block.inputs, ...inputs };
  state.blockInputs.set(block.type, block.inputs);

  if (jaclyConfig.colour) {
    block.colour = jaclyConfig.colour;
  }

  if (block.constructs) {
    registerConstructorType(state, block.constructs, block.type);
  }

  if (block.constructs && block.virtualInstances) {
    registerVirtualInstances(state, block.type, block.virtualInstances);
  }

  Blocks[block.type] = {
    init(this: BlockExtended) {
      const jc = jaclyConfig;
      this.jsonInit(block);
      this.code = block.code;
      this.isProgramStart = block.isProgramStart;
      this.package = jc.package || jc.parentCategory || jc.category;

      this.saveExtraState = function (this: BlockExtended) {
        return { package: this.package };
      };

      if (block.constructs) {
        this.mixin(getConstructorMixin(state, block.constructs));
      }

      if (block.virtualInstances && block.virtualInstances.length > 0) {
        const grouped = new Map<string, string[]>();
        for (const vi of block.virtualInstances) {
          const existing = grouped.get(vi.instanceof) || [];
          existing.push(vi.name);
          grouped.set(vi.instanceof, existing);
        }
        this.appendDummyInput('VI_HEADER').appendField('▸ provides:');
        for (const [type, names] of grouped) {
          const label = `   ${type}: ${names.join(', ')}`;
          this.appendDummyInput(`VI_${type}`).appendField(label);
        }
      }

      if (block.args0) {
        const instanceArgs = block.args0.filter(
          (arg): arg is Extract<(typeof block.args0)[number], { type: 'field_dropdown' }> =>
            arg.type === 'field_dropdown' &&
            !!(arg as { instanceof?: string }).instanceof &&
            !!(arg as { options?: unknown[] }).options &&
            (arg as { options?: unknown[] }).options!.length === 1,
        );

        for (const arg of instanceArgs) {
          const systemId = arg.instanceof!;
          const fieldName = arg.name;

          const field = this.getField(fieldName);
          if (field && field instanceof Blockly.FieldDropdown) {
            const dropdownField = field as FieldDropdownWithMenuGenerator;
            dropdownField.menuGenerator_ = getInstanceDropdownGenerator(
              state,
              systemId,
            ) as Blockly.MenuGenerator & (() => Blockly.MenuGenerator);

            const options = getInstanceDropdownGenerator(state, systemId).call(field) as [
              string,
              string,
            ][];
            if (options.length === 1 && options[0][1] !== 'INVALID') {
              this.setFieldValue(options[0][1], fieldName);
            }
          }

          const existingOnChange = this.onchange;
          this.onchange = function (this: BlockExtended, e: Blockly.Events.Abstract) {
            if (existingOnChange) existingOnChange.call(this, e);
            validateInstanceSelection.call(this, state, systemId, fieldName);
          };
        }

        if (instanceArgs.length > 0) {
          const baseSave = this.saveExtraState!.bind(this);
          this.saveExtraState = function (this: BlockExtended) {
            const instanceNames: Record<string, string> = {};
            for (const arg of instanceArgs) {
              instanceNames[arg.name] = this.getFieldValue(arg.name);
            }
            return { ...baseSave(), instanceNames };
          };

          this.loadExtraState = function (this: BlockExtended, extraState: BlockExtraState) {
            if (extraState.instanceNames) {
              this.savedInstanceNames = extraState.instanceNames;
            } else if (extraState.instanceName && instanceArgs.length === 1) {
              this.savedInstanceNames = { [instanceArgs[0].name]: extraState.instanceName };
            }
          };
        }
      }
    },
  };

  if (block.callbackVars) {
    registerCallbackVarGetters(block, jaclyConfig);
  }
}
