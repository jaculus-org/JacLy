import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import * as chai from 'chai';
import 'mocha';
import { JaclyEngine } from '../../src/engine/engine';

const expect = chai.expect;

function makeMotorBlocksData() {
  return {
    blockFiles: {
      'motor.jacly.json': {
        category: 'motor',
        name: 'Motor',
        colour: '#00aa00',
        contents: [
          {
            kind: 'block',
            type: 'motor_constructor_regparams',
            message0: 'reg params $[REG]',
            args0: [
              {
                type: 'input_value',
                name: 'REG',
                check: 'Number',
                shadow: {
                  type: 'math_number',
                  fields: {
                    NUM: 0,
                  },
                },
              },
            ],
            code: '$[REG]',
            output: 'RegParams',
            hideInToolbox: true,
          },
          {
            kind: 'block',
            type: 'motor_constructor',
            message0: 'motor $[REG_PARAMS]',
            args0: [
              {
                type: 'input_value',
                name: 'REG_PARAMS',
                check: 'RegParams',
                block: {
                  type: 'motor_constructor_regparams',
                },
              },
            ],
            code: 'makeMotor($[REG_PARAMS]);',
            previousStatement: null,
            nextStatement: null,
          },
        ],
      },
    },
  } as any;
}

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

describe('JaclyEngine.reloadBlockData', () => {
  it('enriches late-installed nested blocks through the same pipeline as startup', () => {
    const engine = new JaclyEngine();

    engine.buildToolbox({
      blockFiles: {},
    } as any);

    const toolbox = engine.reloadBlockData(makeMotorBlocksData());

    const motorBlock = getToolboxBlock(toolbox, 'motor', 'motor_constructor');

    expect(motorBlock.inputs.REG_PARAMS.block.type).to.equal('motor_constructor_regparams');
    expect(motorBlock.inputs.REG_PARAMS.block.inputs.REG.shadow.type).to.equal('math_number');
    expect(motorBlock.inputs.REG_PARAMS.block.inputs.REG.shadow.fields.NUM).to.equal(0);
  });

  it('matches startup behavior for nested helper enrichment', () => {
    const startupEngine = new JaclyEngine();
    const reloadedEngine = new JaclyEngine();

    const startupToolbox = startupEngine.buildToolbox(makeMotorBlocksData());
    reloadedEngine.buildToolbox({ blockFiles: {} } as any);
    const reloadedToolbox = reloadedEngine.reloadBlockData(makeMotorBlocksData());

    const startupBlock = getToolboxBlock(startupToolbox, 'motor', 'motor_constructor');
    const reloadedBlock = getToolboxBlock(reloadedToolbox, 'motor', 'motor_constructor');

    expect(reloadedBlock.inputs).to.deep.equal(startupBlock.inputs);
  });

  it('keeps alias-specific nested input overrides when helper blocks are enriched', () => {
    const engine = new JaclyEngine();

    engine.buildToolbox({ blockFiles: {} } as any);

    const toolbox = engine.reloadBlockData({
      blockFiles: {
        'motor.jacly.json': {
          category: 'motor',
          name: 'Motor',
          colour: '#00aa00',
          contents: [
            {
              kind: 'block',
              type: 'motor_constructor_regparams',
              message0: 'reg params $[REG]',
              args0: [
                {
                  type: 'input_value',
                  name: 'REG',
                  check: 'Number',
                  shadow: {
                    type: 'math_number',
                    fields: {
                      NUM: 0,
                    },
                  },
                },
              ],
              code: '$[REG]',
              output: 'RegParams',
              hideInToolbox: true,
            },
            {
              kind: 'block',
              type: 'motor_constructor',
              message0: 'motor $[REG_PARAMS]',
              args0: [
                {
                  type: 'input_value',
                  name: 'REG_PARAMS',
                  check: 'RegParams',
                  block: {
                    type: 'motor_constructor_regparams',
                  },
                },
              ],
              code: 'makeMotor($[REG_PARAMS]);',
              previousStatement: null,
              nextStatement: null,
            },
          ],
        },
        'motor-shortcuts.jacly.json': {
          category: 'motor_shortcuts',
          name: 'Motor Shortcuts',
          colour: '#0088cc',
          contents: [
            {
              kind: 'block',
              type: 'motor_constructor',
              inputs: {
                REG_PARAMS: {
                  block: {
                    type: 'motor_constructor_regparams',
                    inputs: {
                      REG: {
                        shadow: {
                          type: 'math_number',
                          fields: {
                            NUM: 9,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    } as any);

    const shortcutBlock = getToolboxBlock(toolbox, 'motor_shortcuts', 'motor_constructor');

    expect(shortcutBlock.inputs.REG_PARAMS.block.type).to.equal('motor_constructor_regparams');
    expect(shortcutBlock.inputs.REG_PARAMS.block.inputs.REG.shadow.type).to.equal('math_number');
    expect(shortcutBlock.inputs.REG_PARAMS.block.inputs.REG.shadow.fields.NUM).to.equal(9);
  });

  it('removes stale Blockly block registrations and generators on reload', () => {
    const engine = new JaclyEngine();

    engine.buildToolbox({
      blockFiles: {
        'temp.jacly.json': {
          category: 'temp',
          name: 'Temp',
          colour: '#123456',
          contents: [
            {
              kind: 'block',
              type: 'temporary_reload_block',
              message0: 'temp',
              code: 'temp();',
              previousStatement: null,
              nextStatement: null,
            },
          ],
        },
      },
    } as any);

    expect(Blockly.Blocks.temporary_reload_block).to.not.equal(undefined);
    expect(jsg.forBlock.temporary_reload_block).to.be.a('function');

    engine.reloadBlockData({
      blockFiles: {},
    } as any);

    expect(Blockly.Blocks.temporary_reload_block).to.equal(undefined);
    expect(jsg.forBlock.temporary_reload_block).to.equal(undefined);
  });
});
