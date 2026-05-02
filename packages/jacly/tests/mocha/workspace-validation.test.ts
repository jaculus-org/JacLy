import * as chai from 'chai';
import 'mocha';
import * as Blockly from 'blockly/core';
import { registerPlaceholderBlock } from '../../src/blocks/registration/placeholder-block';
import {
  type SanitizationResult,
  sanitizeWorkspaceState,
} from '../../src/workspace/validation/workspace-validation';

const expect = chai.expect;

describe('registerPlaceholderBlock', () => {
  it('registers unsupported_block in Blockly.Blocks', () => {
    registerPlaceholderBlock();
    expect(Blockly.Blocks.unsupported_block).to.be.an('object');
    expect(Blockly.Blocks.unsupported_block.init).to.be.a('function');
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

function unregisterBlock(type: string): void {
  delete (Blockly.Blocks as Record<string, object | undefined>)[type];
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
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].type).to.equal('known_block');
  });

  it('returns SanitizationResult with correct shape', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'known_block', id: '1', x: 0, y: 0 }],
      },
    };
    const result: SanitizationResult = await sanitizeWorkspaceState(json, async () => {});
    expect(result).to.have.property('state');
    expect(result).to.have.property('restoredTypes').that.is.an('array');
    expect(result).to.have.property('replacedTypes').that.is.an('array');
  });

  it('does not mutate the input JSON', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'ghost_block',
            id: '1',
            x: 10,
            y: 20,
            extraState: { package: 'my-pkg' },
          },
        ],
      },
    };
    const original = JSON.stringify(json);
    await sanitizeWorkspaceState(json, async () => {});
    expect(JSON.stringify(json)).to.equal(original);
  });

  it('replaces a missing top-level block with unsupported_block', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'ghost_block',
            id: '1',
            x: 10,
            y: 20,
            extraState: { package: 'my-pkg' },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    const block = ws.blocks.blocks[0];
    expect(block.type).to.equal('unsupported_block');
    expect(block.fields.ORIGINAL_TYPE).to.equal('ghost_block');
    expect(block.extraState.originalState.type).to.equal('ghost_block');
    expect(block.x).to.equal(10);
    expect(block.y).to.equal(20);
  });

  it('reports replaced block types in replacedTypes', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'ghost_block',
            id: '1',
            x: 10,
            y: 20,
            extraState: { package: 'my-pkg' },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    expect(result.replacedTypes).to.include('ghost_block');
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
              VALUE: {
                block: {
                  type: 'ghost_block',
                  id: '2',
                  extraState: { package: 'my-pkg' },
                },
              },
            },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    // Parent block survives
    expect(ws.blocks.blocks[0].type).to.equal('known_block');
    // Nested input is cleared
    expect(ws.blocks.blocks[0].inputs?.VALUE?.block).to.equal(undefined);
    // Hoisted placeholder added as top-level block
    const placeholder = ws.blocks.blocks.find((b: any) => b.type === 'unsupported_block');
    expect(placeholder).to.not.equal(undefined);
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
            next: {
              block: {
                type: 'ghost_block',
                id: '2',
                extraState: { package: 'my-pkg' },
              },
            },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].next.block.type).to.equal('unsupported_block');
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
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].inputs?.VALUE?.shadow).to.equal(undefined);
  });

  it('calls onMissingPackage with all missing packages', async () => {
    let captured: Record<string, Set<string>> = {};
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'ghost_a',
            id: '1',
            x: 0,
            y: 0,
            extraState: { package: 'pkg-x' },
          },
          {
            type: 'ghost_b',
            id: '2',
            x: 0,
            y: 50,
            extraState: { package: 'pkg-x' },
          },
          {
            type: 'ghost_c',
            id: '3',
            x: 0,
            y: 100,
            extraState: { package: 'pkg-y' },
          },
        ],
      },
    };
    await sanitizeWorkspaceState(json, async (pkg) => {
      captured = pkg;
    });
    expect(Object.keys(captured)).to.have.lengthOf(2);
    expect(captured).to.have.property('pkg-x');
    expect(captured).to.have.property('pkg-y');
  });

  it('does not replace a block when block is registered during callback', async () => {
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'late_registered_block',
            id: '1',
            x: 0,
            y: 0,
            extraState: { package: 'late-pkg' },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {
      // Simulate package install: register the block during the callback
      (Blockly.Blocks as Record<string, object>).late_registered_block = {
        init() {},
      };
    });
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].type).to.equal('late_registered_block');
  });

  it('returns json unchanged when blocks key is absent', async () => {
    const json = { variables: [] };
    const result = await sanitizeWorkspaceState(json, async () => {});
    expect(result.state).to.deep.equal({ variables: [] });
    expect(result.restoredTypes).to.deep.equal([]);
    expect(result.replacedTypes).to.deep.equal([]);
  });
});

// ---------------------------------------------------------------------------
// Reverse pass (restore) tests
// ---------------------------------------------------------------------------

describe('sanitizeWorkspaceState — reverse pass (restore)', () => {
  before(() => {
    registerPlaceholderBlock();
    setupBlocks(['known_block']);
  });

  it('restores a top-level unsupported_block when original type is now registered', async () => {
    setupBlocks(['revived_block']);
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'unsupported_block',
            id: 'p1',
            x: 10,
            y: 20,
            fields: { ORIGINAL_TYPE: 'revived_block' },
            extraState: {
              originalState: {
                type: 'revived_block',
                id: 'orig1',
                x: 10,
                y: 20,
                extraState: { package: 'my-pkg' },
              },
            },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].type).to.equal('revived_block');
    expect(ws.blocks.blocks[0].id).to.equal('orig1');
    expect(result.restoredTypes).to.include('revived_block');
    expect(result.replacedTypes).to.not.include('revived_block');
  });

  it('restores an unsupported_block in a next chain', async () => {
    setupBlocks(['revived_next_block']);
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'known_block',
            id: '1',
            x: 0,
            y: 0,
            next: {
              block: {
                type: 'unsupported_block',
                id: 'p2',
                fields: { ORIGINAL_TYPE: 'revived_next_block' },
                extraState: {
                  originalState: {
                    type: 'revived_next_block',
                    id: 'orig2',
                    extraState: { package: 'my-pkg' },
                  },
                },
              },
            },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].next.block.type).to.equal('revived_next_block');
    expect(result.restoredTypes).to.include('revived_next_block');
  });

  it('restores an unsupported_block in an input', async () => {
    setupBlocks(['revived_input_block']);
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
              VALUE: {
                block: {
                  type: 'unsupported_block',
                  id: 'p3',
                  fields: { ORIGINAL_TYPE: 'revived_input_block' },
                  extraState: {
                    originalState: {
                      type: 'revived_input_block',
                      id: 'orig3',
                      extraState: { package: 'my-pkg' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].inputs.VALUE.block.type).to.equal('revived_input_block');
    expect(result.restoredTypes).to.include('revived_input_block');
  });

  it('leaves unsupported_block alone when original type is still missing', async () => {
    // Make sure the type is NOT registered
    unregisterBlock('still_missing_block');
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'unsupported_block',
            id: 'p4',
            x: 5,
            y: 15,
            fields: { ORIGINAL_TYPE: 'still_missing_block' },
            extraState: {
              originalState: {
                type: 'still_missing_block',
                id: 'orig4',
                extraState: { package: 'missing-pkg' },
              },
            },
          },
        ],
      },
    };
    const result = await sanitizeWorkspaceState(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].type).to.equal('unsupported_block');
    expect(result.restoredTypes).to.not.include('still_missing_block');
  });

  it('full round-trip: forward → restore', async () => {
    // Phase 1: forward — convert block to placeholder
    unregisterBlock('roundtrip_block');
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'roundtrip_block',
            id: 'rt1',
            x: 42,
            y: 84,
            extraState: { package: 'rt-pkg' },
          },
        ],
      },
    };
    const forward = await sanitizeWorkspaceState(json, async () => {});
    const wsForward = forward.state as any;
    expect(wsForward.blocks.blocks[0].type).to.equal('unsupported_block');
    expect(forward.replacedTypes).to.include('roundtrip_block');

    // Phase 2: "install" the package — register the block
    setupBlocks(['roundtrip_block']);

    // Phase 3: reverse — restore placeholder to original block
    const restored = await sanitizeWorkspaceState(forward.state, async () => {});
    const wsRestored = restored.state as any;
    expect(wsRestored.blocks.blocks[0].type).to.equal('roundtrip_block');
    expect(wsRestored.blocks.blocks[0].id).to.equal('rt1');
    expect(restored.restoredTypes).to.include('roundtrip_block');
    expect(restored.replacedTypes).to.not.include('roundtrip_block');
  });

  it('rehydrates canonical nested defaults for restored registered blocks', async () => {
    setupBlocks(['motor_constructor', 'motor_constructor_regparams', 'math_number']);

    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'unsupported_block',
            fields: { ORIGINAL_TYPE: 'motor_constructor' },
            extraState: {
              originalState: {
                type: 'motor_constructor',
                id: 'motor-root',
                x: 80,
                y: 60,
              },
            },
          },
        ],
      },
    };

    const result = await sanitizeWorkspaceState(
      json,
      async () => {},
      (type) => {
        if (type === 'motor_constructor') {
          return {
            REG_PARAMS: {
              block: {
                type: 'motor_constructor_regparams',
              },
            },
          };
        }
        if (type === 'motor_constructor_regparams') {
          return {
            REG: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0,
                },
              },
            },
          };
        }
        return undefined;
      },
    );

    const ws = result.state as any;
    expect(ws.blocks.blocks[0].type).to.equal('motor_constructor');
    expect(ws.blocks.blocks[0].inputs.REG_PARAMS.block.type).to.equal(
      'motor_constructor_regparams',
    );
    expect(ws.blocks.blocks[0].inputs.REG_PARAMS.block.inputs.REG.shadow.type).to.equal(
      'math_number',
    );
    expect(ws.blocks.blocks[0].inputs.REG_PARAMS.block.inputs.REG.shadow.fields.NUM).to.equal(0);
  });
});

import { JaclyEngine } from '../../src/engine/engine';

describe('JaclyEngine.validateWorkspace', () => {
  it('is a function on JaclyEngine instances', () => {
    const engine = new JaclyEngine();
    expect(engine.validateWorkspace).to.be.a('function');
  });

  it('returns a SanitizationResult resolving to the sanitized workspace', async () => {
    const engine = new JaclyEngine();
    const json = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'ghost_engine_block',
            id: '1',
            x: 0,
            y: 0,
            extraState: { package: 'ghost-pkg' },
          },
        ],
      },
    };
    const result = await engine.validateWorkspace(json, async () => {});
    const ws = result.state as any;
    expect(ws.blocks.blocks[0].type).to.equal('unsupported_block');
    expect(result.replacedTypes).to.include('ghost_engine_block');
    expect(result).to.have.property('restoredTypes').that.is.an('array');
  });
});
