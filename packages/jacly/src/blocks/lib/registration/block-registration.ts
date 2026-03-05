import { Blocks } from 'blockly/core';
import { JaclyBlock, JaclyBlockKindBlock, JaclyConfig } from '../../schema';
import { BlockExtended } from '../../types/custom-block';
import * as Blockly from 'blockly/core';
import { registeredBlockTypes, blockRegisteredInputs } from './registries';
import {
  getConstructorMixin,
  getInstanceDropdownGenerator,
  registerConstructorType,
  registerVirtualInstances,
  validateInstanceSelection,
} from './constructors';
import {
  registerCallbackVarGetters,
  registerCallbackVarSlots,
} from './callback-vars';
import type {
  FieldDropdownWithMenuGenerator,
  BlockExtraState,
} from '../codegen/placeholder-utils';
import { processArgsForRegistration } from './message-processing';
import { processInputsForRegistration } from './shadow-extraction';

// Register a JacLy block definition with Blockly
export function registerBlocklyBlock(
  block: JaclyBlock,
  jaclyConfig: JaclyConfig
) {
  if (block.kind != 'block') {
    return;
  }

  // Prevent double-registration in React strict mode
  if (registeredBlockTypes.has(block.type)) {
    return;
  }
  registeredBlockTypes.add(block.type);

  const inputs: JaclyBlockKindBlock['inputs'] = {};
  registerCallbackVarSlots(block, inputs);

  // Replace $[NAME] with %1, %2, etc.
  processArgsForRegistration(block);

  // Process shadow blocks and inputs
  processInputsForRegistration(block, inputs);
  block.inputs = { ...block.inputs, ...inputs };
  blockRegisteredInputs.set(block.type, block.inputs);

  // Apply block colors from config
  if (jaclyConfig.colour) {
    block.colour = jaclyConfig.colour;
  }

  if (block.constructs) {
    registerConstructorType(block.constructs, block.type);
  }

  if (block.constructs && block.virtualInstances) {
    registerVirtualInstances(block.type, block.virtualInstances);
  }

  Blocks[block.type] = {
    init(this: BlockExtended) {
      this.jsonInit(block);
      this.code = block.code;
      this.isProgramStart = block.isProgramStart;

      if (block.constructs) {
        this.mixin(getConstructorMixin(block.constructs));
      }

      // Render provided virtual instances
      if (block.virtualInstances && block.virtualInstances.length > 0) {
        // Group by type
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
        block.args0.forEach(arg => {
          if (
            arg.type === 'field_dropdown' &&
            arg.instanceof &&
            arg.options &&
            arg.options.length === 1
          ) {
            const systemId = arg.instanceof;
            const fieldName = arg.name;

            const field = this.getField(fieldName);
            if (field && field instanceof Blockly.FieldDropdown) {
              const dropdownField = field as FieldDropdownWithMenuGenerator;
              dropdownField.menuGenerator_ = getInstanceDropdownGenerator(
                systemId
              ) as Blockly.MenuGenerator & (() => Blockly.MenuGenerator);

              // Auto-select if only 1 option
              const options = getInstanceDropdownGenerator(systemId).call(
                field
              ) as [string, string][];
              if (options.length === 1 && options[0][1] !== 'INVALID') {
                this.setFieldValue(options[0][1], fieldName);
              }
            }

            const existingOnChange = this.onchange;
            this.onchange = function (
              this: BlockExtended,
              e: Blockly.Events.Abstract
            ) {
              if (existingOnChange) existingOnChange.call(this, e);
              validateInstanceSelection.call(this, systemId, fieldName);
            };

            this.saveExtraState = function () {
              return { instanceName: this.getFieldValue(fieldName) };
            };

            this.loadExtraState = function (state: BlockExtraState) {
              this.savedInstanceName = state.instanceName;
            };
          }
        });
      }
    },
  };

  if (block.callbackVars) {
    registerCallbackVarGetters(block, jaclyConfig);
  }
}
