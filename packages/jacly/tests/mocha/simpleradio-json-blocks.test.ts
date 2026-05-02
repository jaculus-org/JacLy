import * as chai from 'chai';
import 'mocha';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import { JaclyEngine } from '../../src/engine/engine';

const expect = chai.expect;

const simpleradioJsonBlocksData = {
  blockFiles: {
    'simpleradio.jacly.json': {
      category: 'simpleradio',
      name: 'SimpleRadio',
      colour: '#9C27B0',
      import: ['import * as simpleradio from "simpleradio";'],
      contents: [
        {
          kind: 'block',
          type: 'sr_sendJson',
          message0: 'send JSON $[SR_JSON]',
          args0: [
            {
              type: 'input_value',
              name: 'SR_JSON',
              check: 'JsonObject',
            },
          ],
          code: 'simpleradio.sendString(JSON.stringify($[SR_JSON]));',
          previousStatement: null,
          nextStatement: null,
        },
        {
          kind: 'block',
          type: 'sr_onReceiveJson',
          message0: 'when JSON received do\n$[SR_CODE]',
          args0: [
            {
              type: 'input_statement',
              name: 'SR_CODE',
            },
          ],
          callbackVars: [
            {
              identifier: 'RECEIVED_JSON',
              message: 'received JSON',
              type: 'JsonObject',
              codeName: 'obj',
            },
            {
              identifier: 'SENDER_ADDRESS',
              message: 'sender address',
              type: 'String',
              codeName: 'info.address',
            },
          ],
          isProgramStart: true,
          code: 'simpleradio.on("string", function(str, info) {\nconst obj = JSON.parse(str);\n$[SR_CODE]\n});',
        },
      ],
    },
  },
} as any;

describe('SimpleRadio JSON blocks', () => {
  it('emits JSON send code through the existing string transport', () => {
    const engine = new JaclyEngine();
    engine.buildToolbox(simpleradioJsonBlocksData);

    const fakeGenerator = {
      valueToCode(_block: unknown, name: string) {
        return name === 'SR_JSON' ? 'payload' : 'null';
      },
    };

    expect(jsg.forBlock.sr_sendJson({} as any, fakeGenerator as any)).to.equal(
      'simpleradio.sendString(JSON.stringify(payload));\n',
    );
  });

  it('emits JSON receive code by parsing the string packet payload', () => {
    const engine = new JaclyEngine();
    engine.buildToolbox(simpleradioJsonBlocksData);

    const fakeGenerator = {
      statementToCode() {
        return 'console.log(obj);\n';
      },
    };

    expect(jsg.forBlock.sr_onReceiveJson({} as any, fakeGenerator as any)).to.equal(
      'simpleradio.on("string", function(str, info) {\nconst obj = JSON.parse(str);\nconsole.log(obj);\n\n});\n',
    );
  });
});
