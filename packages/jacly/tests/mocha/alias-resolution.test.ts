import * as chai from 'chai';
import 'mocha';
import { editInternalBlocks } from '../../src/blocks/aliases/edit-internal-block';
import { createEngineState } from '../../src/engine/engine-state';
import { JaclyBlockLoadError } from '../../src/toolbox/errors';
import { registerFullBlocks } from '../../src/toolbox/loading/block-registration-pass';
import { buildToolboxItem } from '../../src/toolbox/loading/toolbox-item-builder';
import { loadToolboxConfiguration } from '../../src/toolbox/loading/toolbox-loader';
import {
  prepareToolboxConfig,
  registerParsedToolboxBlocks,
} from '../../src/toolbox/loading/toolbox-processing';

const expect = chai.expect;

// -- editInternalBlocks -------------------------------------------------------

describe('editInternalBlocks', () => {
  it('copies registered inputs into the alias block', () => {
    const state = createEngineState();
    state.blockInputs.set('target_block_a', {
      VALUE: { shadow: { type: 'math_number', fields: { NUM: 5 } } },
    });
    const alias: any = { kind: 'block', type: 'target_block_a' };
    editInternalBlocks(state, alias, { category: 'c', name: 'N' } as any);
    expect(alias.inputs?.VALUE?.shadow?.fields?.NUM).to.equal(5);
  });

  it('alias-specific inputs override canonical defaults', () => {
    const state = createEngineState();
    state.blockInputs.set('target_block_b', {
      BRAKE: { shadow: { type: 'logic_boolean', fields: { BOOL: 0 } } },
    });
    const alias: any = {
      kind: 'block',
      type: 'target_block_b',
      inputs: {
        BRAKE: { shadow: { type: 'logic_boolean', fields: { BOOL: 1 } } },
      },
    };
    editInternalBlocks(state, alias, { category: 'c', name: 'N' } as any);
    expect(alias.inputs?.BRAKE?.shadow?.fields?.BOOL).to.equal(1);
  });

  it('two aliases of the same type get independent input objects (no shared refs)', () => {
    const state = createEngineState();
    state.blockInputs.set('target_block_c', {
      VAL: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
    });
    const alias1: any = { kind: 'block', type: 'target_block_c' };
    const alias2: any = { kind: 'block', type: 'target_block_c' };
    const cfg: any = { category: 'c', name: 'N' };
    editInternalBlocks(state, alias1, cfg);
    editInternalBlocks(state, alias2, cfg);
    (alias1.inputs?.VAL.shadow as any).fields.NUM = 99;
    expect((alias2.inputs?.VAL.shadow as any).fields.NUM).to.equal(0);
  });

  it('does nothing when no blockInputs entry exists for the type', () => {
    const state = createEngineState();
    const alias: any = { kind: 'block', type: 'no_such_block_edit' };
    editInternalBlocks(state, alias, { category: 'c', name: 'N' } as any);
    expect(alias.inputs).to.equal(undefined);
  });
});

// -- registerFullBlocks -------------------------------------------------------

describe('registerFullBlocks', () => {
  it('adds full block definitions to state.blockInputs', () => {
    const state = createEngineState();
    registerFullBlocks(state, {
      category: 'cat_reg',
      name: 'Cat Reg',
      colour: '#001122',
      contents: [
        {
          kind: 'block',
          type: 'reg_full_block_1',
          message0: 'run $[VAL]',
          args0: [
            {
              type: 'input_value',
              name: 'VAL',
              shadow: { type: 'math_number', fields: { NUM: 7 } },
            } as any,
          ],
          code: 'run($[VAL]);',
          previousStatement: null,
          nextStatement: null,
        },
      ],
    } as any);
    expect(state.blockInputs.has('reg_full_block_1')).to.equal(true);
    expect((state.blockInputs.get('reg_full_block_1') as any)?.VAL?.shadow?.fields?.NUM).to.equal(
      7,
    );
  });

  it('skips alias-only entries (no message0 / args0 / code)', () => {
    const state = createEngineState();
    registerFullBlocks(state, {
      category: 'cat_skip',
      name: 'Cat Skip',
      colour: '#334455',
      contents: [{ kind: 'block', type: 'alias_only_skip_block' }],
    } as any);
    expect(state.registeredBlockTypes.has('alias_only_skip_block')).to.equal(false);
    expect(state.blockInputs.has('alias_only_skip_block')).to.equal(false);
  });
});

// -- loadToolboxConfiguration two-pass ---------------------------------------

describe('loadToolboxConfiguration - two-pass alias resolution', () => {
  it('alias file loaded BEFORE defining file still receives shadows', () => {
    const state = createEngineState();

    const result = loadToolboxConfiguration(state, {
      blockFiles: {
        // alias file intentionally listed FIRST
        'alias_first.jacly.json': {
          category: 'cat_alias_first',
          name: 'Cat Alias First',
          colour: '#aaaaaa',
          contents: [{ kind: 'block', type: 'twopass_block_unique_x' }],
        },
        'defining.jacly.json': {
          category: 'cat_defining',
          name: 'Cat Defining',
          colour: '#bbbbbb',
          contents: [
            {
              kind: 'block',
              type: 'twopass_block_unique_x',
              message0: 'do $[VAL]',
              args0: [
                {
                  type: 'input_value',
                  name: 'VAL',
                  shadow: { type: 'math_number', fields: { NUM: 42 } },
                },
              ],
              code: 'doX($[VAL]);',
              previousStatement: null,
              nextStatement: null,
            },
          ],
        },
      },
    } as any);

    const catAlias = (result.contents as any[]).find((c) => c.category === 'cat_alias_first');
    const aliasBlock = (catAlias?.contents as any[])?.find(
      (b: any) => b.kind === 'block' && b.type === 'twopass_block_unique_x',
    );
    expect(aliasBlock).to.not.equal(undefined, 'alias block not found in toolbox');
    expect(aliasBlock.inputs?.VAL?.shadow?.type).to.equal('math_number');
    expect(aliasBlock.inputs?.VAL?.shadow?.fields?.NUM).to.equal(42);
  });

  it('throws JaclyBlockLoadError when alias references a type defined nowhere', () => {
    const state = createEngineState();
    expect(() =>
      loadToolboxConfiguration(state, {
        blockFiles: {
          'bad.jacly.json': {
            category: 'cat_bad_alias',
            name: 'Cat Bad',
            colour: '#cccccc',
            contents: [{ kind: 'block', type: 'nonexistent_block_zzz9' }],
          },
        },
      } as any),
    ).to.throw(JaclyBlockLoadError);
  });
});

describe('toolbox processing purity', () => {
  it('prepareToolboxConfig does not mutate the parsed config object', () => {
    const state = createEngineState();
    const parsedConfig: any = {
      fileKey: 'motor-shortcuts.jacly.json',
      config: {
        category: 'motor_shortcuts',
        name: 'Motor Shortcuts',
        colour: '#0088cc',
        contents: [
          {
            kind: 'block',
            type: 'motor_helper',
            message0: 'helper $[REG]',
            args0: [
              {
                type: 'input_value',
                name: 'REG',
                shadow: { type: 'math_number', fields: { NUM: 3 } },
              },
            ],
            code: '$[REG]',
            output: 'RegParams',
            hideInToolbox: true,
          },
          {
            kind: 'block',
            type: 'motor_helper',
          },
        ],
      },
    };

    registerParsedToolboxBlocks(state, [parsedConfig]);
    const snapshot = JSON.parse(JSON.stringify(parsedConfig));

    prepareToolboxConfig(state, parsedConfig);

    expect(parsedConfig).to.deep.equal(snapshot);
  });

  it('buildToolboxItem does not mutate category contents', () => {
    const state = createEngineState();
    const config: any = {
      category: 'demo',
      name: 'Demo',
      colour: '#123123',
      contents: [
        { kind: 'label', text: 'Line 1\nLine 2' },
        {
          kind: 'block',
          type: 'hidden_block',
          hideInToolbox: true,
        },
        {
          kind: 'block',
          type: 'visible_block',
        },
      ],
    };
    const snapshot = JSON.parse(JSON.stringify(config));

    const toolboxItem = buildToolboxItem(state, config);

    expect(config).to.deep.equal(snapshot);
    const contents = toolboxItem.contents as any[];
    expect(contents.some((item) => item.type === 'hidden_block')).to.equal(false);
    expect(
      contents.filter((item) => item.kind === 'label' && item.text.startsWith('Line ')),
    ).to.have.length(2);
    expect(contents.filter((item) => item.type === 'visible_block')).to.have.length(1);
  });
});
