import { Blocks } from 'blockly/core';
import * as Blockly from 'blockly/core';
import { JaclyBlockKindBlock, JaclyConfig } from '../../schema';
import {
  BlockSvgExtended,
  WorkspaceSvgExtended,
} from '../../types/custom-block';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';

export function registerCallbackVarSlots(
  block: JaclyBlockKindBlock,
  inputsEdit: NonNullable<JaclyBlockKindBlock['inputs']>
) {
  if (
    block.callbackVars &&
    block.callbackVars.length > 0 &&
    block.args0 &&
    block.message0
  ) {
    const varInputArgs = block.callbackVars.map(cbVar => ({
      type: 'input_value' as const,
      name: `CALLBACK_VAR_${cbVar.name}`,
      check: cbVar.type,
    }));

    // insert before the first input_statement
    const stmtIndex = block.args0.findIndex(
      arg => arg.type === 'input_statement'
    );

    if (stmtIndex !== -1) {
      block.args0.splice(stmtIndex, 0, ...varInputArgs);

      // update message0 to include the new inputs on the same line as the header
      const stmtPlaceholder = `$[${block.args0[stmtIndex + varInputArgs.length].name}]`;
      const inputPlaceholders = block.callbackVars
        .map(cbVar => `$[CALLBACK_VAR_${cbVar.name}]`)
        .join(' ');
      block.message0 = block.message0.replace(
        stmtPlaceholder,
        `${inputPlaceholders}\n${stmtPlaceholder}`
      );

      // add callback var getter blocks to inputs
      for (const cbVar of block.callbackVars) {
        const getterType = `${block.type}_${cbVar.name}`;
        inputsEdit[`CALLBACK_VAR_${cbVar.name}`] = {
          block: {
            type: getterType,
          },
        };
      }
    }
  }
}

export function registerCallbackVarGetters(
  parentBlock: JaclyBlockKindBlock,
  jaclyConfig: JaclyConfig
) {
  void jaclyConfig;
  if (!parentBlock.callbackVars) return;

  for (const cbVar of parentBlock.callbackVars) {
    const getterType = `${parentBlock.type}_${cbVar.name}`;

    // register the block definition as an argument reporter with copy-on-drag
    Blocks[getterType] = {
      init(this: BlockSvgExtended) {
        this.appendDummyInput().appendField(cbVar.name);
        this.setOutput(true, cbVar.type || null);
        this.setColour('#dc143c');
        this.setTooltip(`${cbVar.name} - callback variable (drag to copy)`);
        this.setInputsInline(true);

        this.callbackVarInputName = `CALLBACK_VAR_${cbVar.name}`;

        // add change listener for drag-to-copy behavior
        this.setOnChange((event: Blockly.Events.Abstract) => {
          if (event.type !== Blockly.Events.BLOCK_MOVE) return;
          const moveEvent = event as Blockly.Events.BlockMove;
          if (moveEvent.blockId !== this.id) return;

          // if we were disconnected from a parent input that expects us
          if (moveEvent.oldParentId && !moveEvent.newParentId) {
            const workspace = this.workspace as WorkspaceSvgExtended;
            const oldParent = workspace.getBlockById(moveEvent.oldParentId);

            if (oldParent && moveEvent.oldInputName) {
              const input = oldParent.getInput(moveEvent.oldInputName);
              if (
                input &&
                input.connection &&
                !input.connection.targetBlock()
              ) {
                // create a new block to fill the slot we just left
                const newBlock = workspace.newBlock(this.type);
                newBlock.callbackVarInputName = this.callbackVarInputName;
                newBlock.initSvg();
                newBlock.render();

                // connect the new block to the parent
                if (newBlock.outputConnection) {
                  input.connection.connect(newBlock.outputConnection);
                }
              }
            }
          }
        });
      },
    };

    // register the code generator
    jsg.forBlock[getterType] = function () {
      return [cbVar.codeName, Order.ATOMIC];
    };
  }
}
