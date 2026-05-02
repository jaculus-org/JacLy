import { expect } from '@playwright/test';
import {
  getCurrentGeneratedCode,
  getTopBlockTypes,
  getWorkspaceJson,
  gotoTestApp,
} from './helpers';
import { test } from './test';

test('restores nested default blocks after a library is installed late', async ({ page, act }) => {
  await gotoTestApp(page, 'late-install-motor');

  await expect.poll(async () => await getTopBlockTypes(page)).toEqual(['unsupported_block']);

  await act(page.getByTestId('install-library').click());

  await expect.poll(async () => await getTopBlockTypes(page)).toEqual(['motor_constructor']);
  await expect
    .poll(async () => {
      return await getWorkspaceJson(page);
    })
    .toMatchObject({
      blocks: {
        blocks: [
          {
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
                          NUM: 0,
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
    });
  await expect.poll(async () => await getCurrentGeneratedCode(page)).toContain('makeMotor(0);');
});
