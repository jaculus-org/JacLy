import * as Blockly from 'blockly/core';
import { Blocks } from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import type { BlockSvgExtended, WorkspaceSvgExtended } from '@/blocks/types/custom-block';
import type { JaclyBlockKindBlock, JaclyConfig } from '@/schema';

// callback variables: read-only blocks that expose scoped variables (e.g. encoder tick count)
// inside a callback body. separate from the instance system, no tracker or dropdowns.
// each getter is auto-connected in its slot; dragging it out spawns a clone in place (drag-to-copy).

// injects a value input per callback var into args0, just before the statement input.
// getter block is pre-connected as default so it appears on first use.
export function registerCallbackVarSlots(
  block: JaclyBlockKindBlock,
  inputsEdit: NonNullable<JaclyBlockKindBlock['inputs']>,
) {
  if (block.callbackVars && block.callbackVars.length > 0 && block.args0 && block.message0) {
    const varInputArgs = block.callbackVars.map((cbVar) => ({
      type: 'input_value' as const,
      name: `CALLBACK_VAR_${cbVar.identifier}`,
      check: cbVar.type,
    }));

    const stmtIndex = block.args0.findIndex((arg) => arg.type === 'input_statement');

    if (stmtIndex !== -1) {
      block.args0.splice(stmtIndex, 0, ...varInputArgs);

      const stmtPlaceholder = `$[${block.args0[stmtIndex + varInputArgs.length].name}]`;
      const inputPlaceholders = block.callbackVars
        .map((cbVar) => `$[CALLBACK_VAR_${cbVar.identifier}]`)
        .join(' ');
      block.message0 = block.message0.replace(
        stmtPlaceholder,
        `${inputPlaceholders}\n${stmtPlaceholder}`,
      );

      for (const cbVar of block.callbackVars) {
        const getterType = `${block.type}_${cbVar.identifier}`;
        inputsEdit[`CALLBACK_VAR_${cbVar.identifier}`] = {
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
  jaclyConfig: JaclyConfig,
) {
  void jaclyConfig;
  if (!parentBlock.callbackVars) return;

  for (const cbVar of parentBlock.callbackVars) {
    const getterType = `${parentBlock.type}_${cbVar.identifier}`;

    Blocks[getterType] = {
      init(this: BlockSvgExtended) {
        this.appendDummyInput().appendField(cbVar.message);
        this.setOutput(true, cbVar.type || null);
        this.setColour('#dc143c');
        this.setTooltip(`${cbVar.message} - callback variable (drag to copy)`);
        this.setInputsInline(true);

        this.callbackVarInputName = `CALLBACK_VAR_${cbVar.identifier}`;

        this.setOnChange((event: Blockly.Events.Abstract) => {
          if (event.type !== Blockly.Events.BLOCK_MOVE) return;
          const moveEvent = event as Blockly.Events.BlockMove;
          if (moveEvent.blockId !== this.id) return;

          // disconnected from parent but not reconnected elsewhere -> spawn a clone in the old slot
          if (moveEvent.oldParentId && !moveEvent.newParentId) {
            const workspace = this.workspace as WorkspaceSvgExtended;
            const oldParent = workspace.getBlockById(moveEvent.oldParentId);

            if (oldParent && moveEvent.oldInputName) {
              const input = oldParent.getInput(moveEvent.oldInputName);
              if (input?.connection && !input.connection.targetBlock()) {
                const newBlock = workspace.newBlock(this.type);
                newBlock.callbackVarInputName = this.callbackVarInputName;
                newBlock.initSvg();
                newBlock.render();

                if (newBlock.outputConnection) {
                  input.connection.connect(newBlock.outputConnection);
                }
              }
            }
          }
        });
      },
    };

    jsg.forBlock[getterType] = () => [cbVar.codeName, Order.ATOMIC];
  }
}
