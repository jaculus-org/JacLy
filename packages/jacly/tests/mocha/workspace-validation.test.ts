import * as chai from 'chai';
import 'mocha';
import * as Blockly from 'blockly/core';
import { registerPlaceholderBlock } from '../../src/core/registration/placeholder-block';
import { sanitizeWorkspaceState } from '../../src/core/workspace/workspace-validation';

const expect = chai.expect;

describe('registerPlaceholderBlock', () => {
  it('registers unsupported_block in Blockly.Blocks', () => {
    registerPlaceholderBlock();
    expect(Blockly.Blocks['unsupported_block']).to.be.an('object');
    expect(Blockly.Blocks['unsupported_block'].init).to.be.a('function');
  });

  it('is idempotent — calling twice does not throw', () => {
    expect(() => {
      registerPlaceholderBlock();
      registerPlaceholderBlock();
    }).not.to.throw();
  });
});

// Set up minimal Blockly.Blocks stubs before sanitization tests
function setupBlocks(knownTypes: string[]): void {
  for (const type of knownTypes) {
    if (!Blockly.Blocks[type]) {
      (Blockly.Blocks as Record<string, object>)[type] = { init() {} };
    }
  }
}

describe('sanitizeWorkspaceState', () => {
  before(() => {
    registerPlaceholderBlock();
    setupBlocks(['known_block', 'known_output_block']);
  });

  it('returns input unchanged when all block types are registered', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'known_block', id: '1', x: 0, y: 0 }],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => false);
    expect((result as any).blocks.blocks[0].type).to.equal('known_block');
  });

  it('does not mutate the input JSON', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'ghost_block', id: '1', x: 10, y: 20, extraState: { package: 'my-pkg' } }],
      },
    };
    const original = JSON.stringify(json);
    await sanitizeWorkspaceState(json, async () => false);
    expect(JSON.stringify(json)).to.equal(original);
  });

  it('replaces a missing top-level block with unsupported_block', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'ghost_block', id: '1', x: 10, y: 20, extraState: { package: 'my-pkg' } }],
      },
    };
    const result = (await sanitizeWorkspaceState(json, async () => false)) as any;
    const block = result.blocks.blocks[0];
    expect(block.type).to.equal('unsupported_block');
    expect(block.fields.ORIGINAL_TYPE).to.equal('ghost_block');
    expect(block.extraState.originalState.type).to.equal('ghost_block');
    expect(block.x).to.equal(10);
    expect(block.y).to.equal(20);
  });

  it('hoists a missing nested input block to top-level', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'known_block',
            id: '1',
            x: 0,
            y: 0,
            inputs: {
              VALUE: { block: { type: 'ghost_block', id: '2', extraState: { package: 'my-pkg' } } },
            },
          },
        ],
      },
    };
    const result = (await sanitizeWorkspaceState(json, async () => false)) as any;
    // Parent block survives
    expect(result.blocks.blocks[0].type).to.equal('known_block');
    // Nested input is cleared
    expect(result.blocks.blocks[0].inputs?.VALUE?.block).to.be.undefined;
    // Hoisted placeholder added as top-level block
    const placeholder = result.blocks.blocks.find((b: any) => b.type === 'unsupported_block');
    expect(placeholder).to.exist;
    expect(placeholder.extraState.originalState.type).to.equal('ghost_block');
  });

  it('replaces a missing next.block with unsupported_block', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'known_block',
            id: '1',
            x: 0,
            y: 0,
            next: { block: { type: 'ghost_block', id: '2', extraState: { package: 'my-pkg' } } },
          },
        ],
      },
    };
    const result = (await sanitizeWorkspaceState(json, async () => false)) as any;
    expect(result.blocks.blocks[0].next.block.type).to.equal('unsupported_block');
  });

  it('removes an unresolved shadow block', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'known_block',
            id: '1',
            x: 0,
            y: 0,
            inputs: {
              VALUE: { shadow: { type: 'ghost_shadow', id: '2' } },
            },
          },
        ],
      },
    };
    const result = (await sanitizeWorkspaceState(json, async () => false)) as any;
    expect(result.blocks.blocks[0].inputs?.VALUE?.shadow).to.be.undefined;
  });

  it('calls onMissingPackage once per unique package, not once per block', async () => {
    const calls: string[] = [];
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          { type: 'ghost_a', id: '1', x: 0, y: 0, extraState: { package: 'pkg-x' } },
          { type: 'ghost_b', id: '2', x: 0, y: 50, extraState: { package: 'pkg-x' } },
          { type: 'ghost_c', id: '3', x: 0, y: 100, extraState: { package: 'pkg-y' } },
        ],
      },
    };
    await sanitizeWorkspaceState(json, async (pkg) => {
      calls.push(pkg);
      return false;
    });
    expect(calls).to.have.lengthOf(2);
    expect(calls).to.include('pkg-x');
    expect(calls).to.include('pkg-y');
  });

  it('does not replace a block when callback returns true and block is now registered', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'late_registered_block', id: '1', x: 0, y: 0, extraState: { package: 'late-pkg' } }],
      },
    };
    const result = (await sanitizeWorkspaceState(json, async (pkg) => {
      // Simulate package install: register the block
      if (pkg === 'late-pkg') {
        (Blockly.Blocks as Record<string, object>)['late_registered_block'] = { init() {} };
      }
      return true;
    })) as any;
    expect(result.blocks.blocks[0].type).to.equal('late_registered_block');
  });

  it('returns json unchanged when blocks key is absent', async () => {
    const json = { variables: [] };
    const result = await sanitizeWorkspaceState(json, async () => false);
    expect(result).to.deep.equal({ variables: [] });
  });
});

import { JaclyEngine } from '../../src/engine/engine';

describe('JaclyEngine.validateWorkspace', () => {
  it('is a function on JaclyEngine instances', () => {
    const engine = new JaclyEngine();
    expect(engine.validateWorkspace).to.be.a('function');
  });

  it('returns a promise resolving to the sanitized workspace', async () => {
    const engine = new JaclyEngine();
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'ghost_engine_block', id: '1', x: 0, y: 0, extraState: { package: 'ghost-pkg' } }],
      },
    };
    const result = (await engine.validateWorkspace(json, async () => false)) as any;
    expect(result.blocks.blocks[0].type).to.equal('unsupported_block');
  });
});
