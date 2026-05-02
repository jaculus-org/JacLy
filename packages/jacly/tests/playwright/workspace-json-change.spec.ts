import { expect } from '@playwright/test';
import {
  dragToolboxBlockToWorkspace,
  getLatestJsonChange,
  gotoTestApp,
  openToolboxCategory,
  waitForToolboxBlock,
} from './helpers';
import { test } from './test';

test('emits workspace JSON after a block is added', async ({ page, act }) => {
  await gotoTestApp(page);
  await openToolboxCategory(page, act, 'Basic');
  await waitForToolboxBlock(page, 'basic_do_thing');
  await dragToolboxBlockToWorkspace(page, act, 'basic_do_thing');

  await expect
    .poll(async () => {
      return await getLatestJsonChange(page);
    })
    .toMatchObject({
      blocks: {
        blocks: [
          {
            type: 'basic_do_thing',
          },
        ],
      },
    });
});
