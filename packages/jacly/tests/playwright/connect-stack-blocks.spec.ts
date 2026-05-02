import { expect } from '@playwright/test';
import {
  dragToolboxBlockToWorkspace,
  dragWorkspaceBlockToConnection,
  expectBlockCount,
  getAllBlockIds,
  getLatestJsonChange,
  getTopBlockTypes,
  gotoTestApp,
  openToolboxCategory,
  waitForToolboxBlock,
} from './helpers';
import { test } from './test';

test('connects a second statement block below the first block', async ({ page, act }) => {
  await gotoTestApp(page);
  await openToolboxCategory(page, act, 'Basic');
  await waitForToolboxBlock(page, 'basic_do_thing');

  await dragToolboxBlockToWorkspace(page, act, 'basic_do_thing');
  await expectBlockCount(page, 1);

  const [firstBlockId] = await getAllBlockIds(page);
  await openToolboxCategory(page, act, 'Basic');
  await waitForToolboxBlock(page, 'basic_do_thing');
  await dragToolboxBlockToWorkspace(page, act, 'basic_do_thing');
  await expectBlockCount(page, 2);
  const blockIds = await getAllBlockIds(page);
  const secondBlockId = blockIds.find((id) => id !== firstBlockId);
  if (!secondBlockId) {
    throw new Error('Second workspace block was not created');
  }

  await dragWorkspaceBlockToConnection(page, act, secondBlockId, firstBlockId, 'next');

  await expectBlockCount(page, 2);
  await expect.poll(async () => await getTopBlockTypes(page)).toEqual(['basic_do_thing']);
  await expect
    .poll(async () => {
      return await getLatestJsonChange(page);
    })
    .toMatchObject({
      blocks: {
        blocks: [
          {
            type: 'basic_do_thing',
            next: {
              block: {
                type: 'basic_do_thing',
              },
            },
          },
        ],
      },
    });
});
