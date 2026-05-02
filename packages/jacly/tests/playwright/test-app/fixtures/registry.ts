import type { JaclyBlocksData } from '@jaculus/project';
import { basicBlocksData, emptyWorkspace } from './basic-blocks';

export type TestFixture = {
  jaclyBlocksData: JaclyBlocksData;
  initialJson: object;
  installableJaclyBlocksData?: JaclyBlocksData;
};

const fixtures: Record<string, TestFixture> = {
  basic: {
    jaclyBlocksData: basicBlocksData,
    initialJson: emptyWorkspace,
  },
  codegen: {
    jaclyBlocksData: {
      blockFiles: {
        'basic.jacly.json': {
          category: 'basic',
          name: 'Basic',
          colour: '#4c97ff',
          contents: [
            {
              kind: 'block',
              type: 'basic_value',
              message0: 'value',
              code: '42',
              output: 'Number',
            },
            {
              kind: 'block',
              type: 'basic_program',
              message0: 'program value $[VALUE]',
              args0: [
                {
                  type: 'input_value',
                  name: 'VALUE',
                  check: 'Number',
                },
              ],
              code: 'emit($[VALUE]);',
              isProgramStart: true,
              hideInToolbox: true,
            },
          ],
        },
      },
    } as JaclyBlocksData,
    initialJson: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'basic_program',
            id: 'program-root',
            x: 80,
            y: 60,
          },
        ],
      },
    },
  },
  'late-install-motor': {
    jaclyBlocksData: {
      blockFiles: {},
    } as JaclyBlocksData,
    installableJaclyBlocksData: {
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
              isProgramStart: true,
              previousStatement: null,
              nextStatement: null,
            },
          ],
        },
      },
    } as JaclyBlocksData,
    initialJson: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'motor_constructor',
            id: 'motor-root',
            x: 80,
            y: 60,
            extraState: {
              package: 'motor',
            },
          },
        ],
      },
    },
  },
};

export function getFixture(name: string): TestFixture {
  const fixture = fixtures[name];
  if (!fixture) {
    throw new Error(`Unknown Jacly test fixture "${name}"`);
  }
  return fixture;
}
