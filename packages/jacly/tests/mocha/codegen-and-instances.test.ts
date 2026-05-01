import * as chai from 'chai';
import 'mocha';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import { createInstanceTracker } from '../../src/blocks/instances/instance-tracker';
import { registerCodeGenerator } from '../../src/codegen/generators/register-code-generator';
import { createEngineState } from '../../src/engine/engine-state';

const expect = chai.expect;

function makeBlock(id: string, type: string, constructedName: string) {
  return {
    id,
    type,
    isEnabled() {
      return true;
    },
    getFieldValue(name: string) {
      if (name === 'CONSTRUCTED_VAR_NAME') return constructedName;
      return '';
    },
  };
}

describe('createInstanceTracker', () => {
  it('resolves virtual instance connections from provider constructor names', () => {
    const state = createEngineState();
    state.constructorBlockTypesBySystem.set('robutek', new Set(['robutek_constructor']));
    state.virtualDefsByProviderBlockType.set('robutek_constructor', [
      {
        instanceof: 'motor',
        name: 'leftMotor',
        connection: '$[CONSTRUCTED_VAR_NAME].leftMotor',
      },
    ]);

    const providerBlock = makeBlock('provider-1', 'robutek_constructor', 'robot_0');
    const workspace = {
      getBlocksByType(blockType: string) {
        if (blockType === 'robutek_constructor') return [providerBlock];
        return [];
      },
      getBlockById(id: string) {
        return id === providerBlock.id ? providerBlock : null;
      },
    };

    const tracker = createInstanceTracker(state, workspace as any);
    tracker.rebuild();

    expect(tracker.getOptions('motor')).to.deep.equal(['robot_0.leftMotor']);
    expect(tracker.resolveVirtualConnection('motor', 'robot_0.leftMotor')).to.equal(
      'robot_0.leftMotor',
    );
  });

  it('hides ambiguous virtual instance labels from dropdown options', () => {
    const state = createEngineState();
    state.constructorBlockTypesBySystem.set('carrier', new Set(['carrier_constructor']));
    state.virtualDefsByProviderBlockType.set('carrier_constructor', [
      {
        instanceof: 'sensor',
        name: 'portA',
        connection: '$[CONSTRUCTED_VAR_NAME].portA',
      },
    ]);

    const blocks = [
      makeBlock('provider-1', 'carrier_constructor', 'carrier_0'),
      makeBlock('provider-2', 'carrier_constructor', 'carrier_0'),
    ];
    const workspace = {
      getBlocksByType(blockType: string) {
        if (blockType === 'carrier_constructor') return blocks;
        return [];
      },
      getBlockById(id: string) {
        return blocks.find((block) => block.id === id) ?? null;
      },
    };

    const tracker = createInstanceTracker(state, workspace as any);
    tracker.rebuild();

    expect(tracker.getOptions('sensor')).to.deep.equal([]);
    expect(tracker.resolveVirtualConnection('sensor', 'carrier_0.portA')).to.equal(null);
  });
});

describe('registerCodeGenerator', () => {
  it('strips declaration keywords for constructor blocks', () => {
    const state = createEngineState();
    const blockDef: any = {
      kind: 'block',
      type: 'generator_constructor_block',
      code: 'const created = makeThing();',
      constructs: 'thing',
    };

    registerCodeGenerator(state, blockDef);

    const generated = jsg.forBlock.generator_constructor_block({} as any, {} as any);
    expect(generated).to.equal('created = makeThing();\n');
  });

  it('uses matching codeConditionals before falling back to default code', () => {
    const state = createEngineState();
    const blockDef: any = {
      kind: 'block',
      type: 'generator_conditional_block',
      args0: [
        {
          type: 'field_dropdown',
          name: 'MODE',
          options: [
            ['Fast', 'fast'],
            ['Slow', 'slow'],
          ],
        },
      ],
      code: 'runDefault();',
      codeConditionals: [
        {
          condition: [{ '$[MODE]': 'fast' }],
          code: 'runFast();',
        },
      ],
      previousStatement: null,
      nextStatement: null,
    };

    registerCodeGenerator(state, blockDef);

    const fakeBlock = {
      getFieldValue(name: string) {
        return name === 'MODE' ? 'fast' : '';
      },
    };
    const generated = jsg.forBlock.generator_conditional_block(fakeBlock as any, {} as any);

    expect(generated).to.equal('runFast();\n');
  });
});
