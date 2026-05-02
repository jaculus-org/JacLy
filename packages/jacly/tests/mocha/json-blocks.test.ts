import type * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import * as chai from 'chai';
import 'mocha';
import { JaclyEngine } from '../../src/engine/engine';
import { jsonBlocksData } from '../shared/json-blocks-fixture';
import '../../src/blocks/built-ins/json-object';

const expect = chai.expect;

function getToolboxBlock(
  toolbox: Blockly.utils.toolbox.ToolboxDefinition,
  category: string,
  type: string,
) {
  const toolboxCategory = (toolbox.contents as any[]).find((item) => item.category === category);
  expect(toolboxCategory, `category "${category}" not found`).to.not.equal(undefined);
  const block = toolboxCategory.contents.find((item: any) => item.type === type);
  expect(block, `block "${type}" not found in category "${category}"`).to.not.equal(undefined);
  return block;
}

describe('JSON blocks', () => {
  it('loads the JSON toolbox category including the built-in object creator alias', () => {
    const engine = new JaclyEngine();
    const toolbox = engine.buildToolbox(jsonBlocksData as any);

    const objectCreate = getToolboxBlock(toolbox, 'json', 'json_object_create');
    const objectToText = getToolboxBlock(toolbox, 'json', 'json_object_to_text');

    expect(objectCreate.type).to.equal('json_object_create');
    expect(objectToText.type).to.equal('json_object_to_text');
  });

  it('generates expected code for plain JSON helper blocks', () => {
    const engine = new JaclyEngine();
    engine.buildToolbox(jsonBlocksData as any);

    const fakeGenerator = {
      valueToCode(_block: unknown, name: string) {
        switch (name) {
          case 'TEXT':
            return '"{\\"key\\":\\"value\\"}"';
          case 'VALUE':
            return 'payload';
          case 'OBJECT':
            return 'store';
          case 'KEY':
            return '"name"';
          default:
            return 'null';
        }
      },
      statementToCode() {
        return '';
      },
    };

    expect(jsg.forBlock.json_text_to_object({} as any, fakeGenerator as any)).to.deep.equal([
      'JSON.parse("{\\"key\\":\\"value\\"}")',
      Order.NONE,
    ]);
    expect(jsg.forBlock.json_object_to_text({} as any, fakeGenerator as any)).to.deep.equal([
      'JSON.stringify(payload)',
      Order.NONE,
    ]);
    expect(jsg.forBlock.json_object_contains_key({} as any, fakeGenerator as any)).to.deep.equal([
      'Object.prototype.hasOwnProperty.call(store, "name")',
      Order.NONE,
    ]);
    expect(jsg.forBlock.json_object_get_key({} as any, fakeGenerator as any)).to.deep.equal([
      '(store["name"])',
      Order.NONE,
    ]);
    expect(jsg.forBlock.json_object_set_key({} as any, fakeGenerator as any)).to.equal(
      'store["name"] = payload;\n',
    );
    expect(jsg.forBlock.json_object_delete_key({} as any, fakeGenerator as any)).to.equal(
      'delete store["name"];\n',
    );
  });

  it('generates object literal code from entry statements', () => {
    const fakeGenerator = {
      statementToCode() {
        return '  ["key"]: "value",\n';
      },
    };

    expect(jsg.forBlock.json_object_create({} as any, fakeGenerator as any)).to.deep.equal([
      '({\n  ["key"]: "value",\n})',
      Order.ATOMIC,
    ]);
  });
});
