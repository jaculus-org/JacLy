import { expect } from '@playwright/test';
import {
  dragToolboxBlockToWorkspace,
  expectBlockCount,
  getTopBlockTypes,
  gotoTestApp,
  openToolboxCategory,
  waitForToolboxBlock,
} from './helpers';
import { test } from './test';

test('drags a toolbox block into the workspace', async ({ page, act }) => {
  await gotoTestApp(page);
  await openToolboxCategory(page, act, 'Basic');
  await waitForToolboxBlock(page, 'basic_do_thing');
  await dragToolboxBlockToWorkspace(page, act, 'basic_do_thing');
  await expectBlockCount(page, 1);
  await expect.poll(async () => await getTopBlockTypes(page)).toEqual(['basic_do_thing']);
});
