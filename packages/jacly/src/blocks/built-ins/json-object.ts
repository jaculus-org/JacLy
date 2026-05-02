import * as Blockly from 'blockly/core';
import { Blocks } from 'blockly/core';
import { type JavascriptGenerator, javascriptGenerator as jsg, Order } from 'blockly/javascript';
import type {
  BlockExtended,
  BlockSvgExtended,
  WorkspaceSvgExtended,
} from '@/blocks/types/custom-block';
import { t } from '@/toolbox/translations/translations';
import { addShadowText } from '@/workspace/shadows/shadow-blocks';

const PLUS_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' +
    '<rect x="1" y="1" width="14" height="14" rx="3" fill="#ffffff" fill-opacity="0.18"/>' +
    '<path d="M8 4.25v7.5M4.25 8h7.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>',
)}`;

interface JsonObjectCreateBlock extends BlockExtended {
  addEntryBlock_: () => void;
}

function appendEntryBlock(block: JsonObjectCreateBlock) {
  if (!Blockly.Blocks.json_object_entry) {
    throw new Error('json_object_entry block must be registered before using json_object_create');
  }

  const workspace = block.workspace as WorkspaceSvgExtended | Blockly.Workspace;
  const entryBlock = workspace.newBlock('json_object_entry') as BlockSvgExtended;
  addShadowText(entryBlock, 'KEY', 'key');
  addShadowText(entryBlock, 'VALUE', 'value');
  entryBlock.initSvg?.();
  entryBlock.render?.();

  const stackConnection = block.getInput('PAIRS')?.connection;
  if (!stackConnection || !entryBlock.previousConnection) return;

  const firstEntry = stackConnection.targetBlock();
  if (!firstEntry) {
    stackConnection.connect(entryBlock.previousConnection);
    return;
  }

  let lastEntry = firstEntry;
  while (lastEntry.nextConnection?.targetBlock()) {
    lastEntry = lastEntry.nextConnection.targetBlock()!;
  }

  lastEntry.nextConnection?.connect(entryBlock.previousConnection);
}

Blocks.json_object_create = {
  init(this: JsonObjectCreateBlock) {
    this.appendDummyInput('HEADER')
      .appendField(t('json_object_create_message0', 'create object'))
      .appendField(
        new Blockly.FieldImage(PLUS_ICON, 16, 16, '+', () => {
          appendEntryBlock(this);
        }),
        'ADD_PAIR',
      );

    this.appendStatementInput('PAIRS').setCheck('JsonObjectEntry');
    this.setOutput(true, 'JsonObject');
    this.setColour('#d81b60');
    this.setTooltip(
      t('json_object_create_tooltip', 'Create a JSON object. Use + to add key/value entries.'),
    );
  },
};

jsg.forBlock.json_object_create = (codeBlock: BlockExtended, generator: JavascriptGenerator) => {
  const entries = generator.statementToCode(codeBlock, 'PAIRS') || '';
  const code = entries.trim() ? `({\n${entries}})` : '({})';
  return [code, Order.ATOMIC];
};
