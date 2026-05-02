import * as chai from 'chai';
import 'mocha';
import { Blocks } from 'blockly/core';
import { javascriptGenerator as jsg, Order } from 'blockly/javascript';
import { JaclyEngine } from '../../src/engine/engine';

const expect = chai.expect;

describe('callbackVars', () => {
  it('keeps identifiers stable while localizing callback variable messages', () => {
    const data: any = {
      translations: {
        CALLBACK_PARENT_CALLBACK_DISPLAY: 'sender address',
      },
      blockFiles: {
        'callback.jacly.json': {
          category: 'test',
          name: 'Test',
          contents: [
            {
              kind: 'block',
              type: 'callback_parent',
              message0: 'when called do\n$[BODY]',
              args0: [
                {
                  type: 'input_statement',
                  name: 'BODY',
                },
              ],
              callbackVars: [
                {
                  identifier: 'SENDER_ADDRESS',
                  message: '%DISPLAY%',
                  type: 'String',
                  codeName: 'info.address',
                },
              ],
              code: '$[BODY]',
              previousStatement: null,
              nextStatement: null,
            },
          ],
        },
      },
    };

    const engine = new JaclyEngine();
    engine.buildToolbox(data);

    const inputs = (engine as any).state.blockInputs.get('callback_parent');
    expect(inputs).to.have.property('CALLBACK_VAR_SENDER_ADDRESS');
    expect(inputs.CALLBACK_VAR_SENDER_ADDRESS).to.deep.equal({
      block: {
        type: 'callback_parent_SENDER_ADDRESS',
      },
    });

    const getterType = 'callback_parent_SENDER_ADDRESS';
    const appendedFields: string[] = [];
    const fakeBlock: any = {
      appendDummyInput() {
        return {
          appendField(value: string) {
            appendedFields.push(value);
            return this;
          },
        };
      },
      setOutput(_hasOutput: boolean, _type: string | null) {},
      setColour(_colour: string) {},
      setTooltip(value: string) {
        this.tooltip = value;
      },
      setInputsInline(_inline: boolean) {},
      setOnChange(_handler: unknown) {},
    };

    Blocks[getterType].init.call(fakeBlock);

    expect(appendedFields).to.deep.equal(['sender address']);
    expect(fakeBlock.callbackVarInputName).to.equal('CALLBACK_VAR_SENDER_ADDRESS');
    expect(fakeBlock.tooltip).to.equal('sender address - callback variable (drag to copy)');
    expect(jsg.forBlock[getterType]({} as any, {} as any)).to.deep.equal([
      'info.address',
      Order.ATOMIC,
    ]);

    delete Blocks[getterType];
    delete jsg.forBlock[getterType];
  });
});
