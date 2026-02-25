import * as Blockly from 'blockly/core';
import { Blocks } from 'blockly/core';
import { BlockExtended, BlockSvgExtended } from '../types/custom-block';
import {
  JavascriptGenerator,
  javascriptGenerator as jsg,
} from 'blockly/javascript';

interface PromiseAllBlock extends BlockExtended {
  itemCount_: number;
  updateShape_: () => void;
  reconnectChildBlocks_: (
    connections: Array<Blockly.Connection | null>
  ) => void;
}

type PromiseAllContainerBlock = Blockly.Block;

interface PromiseAllItemBlock extends Blockly.Block {
  statementConnection_?: Blockly.Connection | null;
}

interface PromiseAllExtraState {
  itemCount?: number;
}

// ============================================================================
// Mutator mixin for basic_promise_all
// ============================================================================

const PROMISE_ALL_MUTATOR_MIXIN = {
  itemCount_: 2,

  /**
   * Returns the state of this block as a JSON serializable object.
   */
  saveExtraState: function (
    this: PromiseAllBlock
  ): PromiseAllExtraState | null {
    if (this.itemCount_ === 2) {
      return null;
    }
    return {
      itemCount: this.itemCount_,
    };
  },

  /**
   * Applies the given state to this block.
   */
  loadExtraState: function (
    this: PromiseAllBlock,
    state: PromiseAllExtraState
  ) {
    this.itemCount_ = state.itemCount ?? 2;
    this.updateShape_();
  },

  /**
   * Populate the mutator's dialog with this block's components.
   */
  decompose: function (
    this: PromiseAllBlock,
    workspace: Blockly.Workspace
  ): PromiseAllContainerBlock {
    const containerBlock = workspace.newBlock(
      'basic_promise_all_container'
    ) as PromiseAllContainerBlock;
    (containerBlock as BlockSvgExtended).initSvg();

    let connection = containerBlock.getInput('STACK')!.connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock(
        'basic_promise_all_item'
      ) as PromiseAllItemBlock;
      (itemBlock as BlockSvgExtended).initSvg();
      connection!.connect(itemBlock.previousConnection!);
      connection = itemBlock.nextConnection;
    }

    return containerBlock;
  },

  /**
   * Reconfigure this block based on the mutator dialog's components.
   */
  compose: function (
    this: PromiseAllBlock,
    containerBlock: PromiseAllContainerBlock
  ) {
    let itemBlock = containerBlock.getInputTargetBlock(
      'STACK'
    ) as PromiseAllItemBlock | null;

    // Collect connections from item blocks
    const connections: Array<Blockly.Connection | null> = [];
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock() as PromiseAllItemBlock | null;
        continue;
      }
      connections.push(itemBlock.statementConnection_ ?? null);
      itemBlock = itemBlock.getNextBlock() as PromiseAllItemBlock | null;
    }

    // Disconnect any children that don't belong
    for (let i = 0; i < this.itemCount_; i++) {
      const input = this.getInput('TASK' + i);
      if (input) {
        const connection = input.connection?.targetConnection;
        if (connection && !connections.includes(connection)) {
          connection.disconnect();
        }
      }
    }

    this.itemCount_ = connections.length;
    this.updateShape_();

    // Reconnect child blocks
    this.reconnectChildBlocks_(connections);
  },

  /**
   * Store pointers to any connected child blocks.
   */
  saveConnections: function (
    this: PromiseAllBlock,
    containerBlock: PromiseAllContainerBlock
  ) {
    let itemBlock = containerBlock.getInputTargetBlock(
      'STACK'
    ) as PromiseAllItemBlock | null;

    let i = 0;
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock() as PromiseAllItemBlock | null;
        continue;
      }
      const input = this.getInput('TASK' + i);
      itemBlock.statementConnection_ =
        input?.connection?.targetConnection ?? null;
      i++;
      itemBlock = itemBlock.getNextBlock() as PromiseAllItemBlock | null;
    }
  },

  /**
   * Modify this block to have the correct number of inputs.
   */
  updateShape_: function (this: PromiseAllBlock) {
    // Remove all existing TASK inputs
    for (let i = 0; this.getInput('TASK' + i); i++) {
      this.removeInput('TASK' + i);
    }

    // Add new inputs
    for (let i = 0; i < this.itemCount_; i++) {
      this.appendStatementInput('TASK' + i).appendField(i === 0 ? '' : '');
    }
  },

  /**
   * Reconnect any child blocks.
   */
  reconnectChildBlocks_: function (
    this: PromiseAllBlock,
    connections: Array<Blockly.Connection | null>
  ) {
    for (let i = 0; i < this.itemCount_; i++) {
      connections[i]?.reconnect(this, 'TASK' + i);
    }
  },
};

// ============================================================================
// Register mutator
// ============================================================================

Blockly.Extensions.registerMutator(
  'basic_promise_all_mutator',
  PROMISE_ALL_MUTATOR_MIXIN,
  function (this: PromiseAllBlock) {
    // Helper function run after mixin is applied
    this.itemCount_ = 2;
    this.updateShape_();
  },
  ['basic_promise_all_item']
);

// ============================================================================
// Mutator UI blocks
// ============================================================================

Blocks['basic_promise_all_container'] = {
  init: function (this: PromiseAllContainerBlock) {
    this.setStyle('logic_blocks');
    this.appendDummyInput().appendField(
      Blockly.Msg['BASIC_PROMISE_ALL_CONTAINER'] || 'parallel tasks'
    );
    this.appendStatementInput('STACK');
    this.setTooltip(
      Blockly.Msg['BASIC_PROMISE_ALL_CONTAINER_TOOLTIP'] ||
        'Add, remove, or reorder task slots'
    );
    this.contextMenu = false;
  },
};

Blocks['basic_promise_all_item'] = {
  init: function (this: PromiseAllItemBlock) {
    this.setStyle('logic_blocks');
    this.appendDummyInput().appendField(
      Blockly.Msg['BASIC_PROMISE_ALL_ITEM'] || 'task'
    );
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(
      Blockly.Msg['BASIC_PROMISE_ALL_ITEM_TOOLTIP'] ||
        'Add a parallel task slot'
    );
    this.contextMenu = false;
  },
};

jsg.forBlock['basic_promise_all'] = function (
  codeBlock: BlockExtended,
  generator: JavascriptGenerator
) {
  const block = codeBlock as PromiseAllBlock;
  const tasks: string[] = [];

  for (let i = 0; i < block.itemCount_; i++) {
    const statementCode = generator.statementToCode(block, 'TASK' + i);

    if (statementCode.trim()) {
      const wrapped =
        `(async () => {\n` + `  ${statementCode.trim()}\n` + `})()`;
      tasks.push(wrapped);
    }
  }

  if (tasks.length === 0) {
    return '';
  }

  const arrayContent = tasks.join(',\n');
  return `await Promise.all([\n${arrayContent}\n]);\n`;
};
