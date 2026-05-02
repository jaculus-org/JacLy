import { expect } from '@playwright/test';
import {
  clickBlockField,
  dragToolboxBlockToInput,
  dragWorkspaceBlockToInput,
  expectBlockCount,
  getBlockIdsByType,
  gotoTestApp,
  openToolboxCategory,
  waitForGeneratedCodeSubstring,
  waitForToolboxBlock,
} from './helpers';
import { test } from './test';

test('creates JSON object entries with the plus button and emits object literal code', async ({
  page,
  act,
}) => {
  await gotoTestApp(page, 'json-codegen');
  await openToolboxCategory(page, act, 'JSON');
  await waitForToolboxBlock(page, 'json_object_create');
  await dragToolboxBlockToInput(page, act, 'json_object_create', 'json-program-root', 'OBJ');

  await expectBlockCount(page, 2);

  const [objectBlockId] = await getBlockIdsByType(page, 'json_object_create');
  expect(objectBlockId).toBeTruthy();

  await dragWorkspaceBlockToInput(page, act, objectBlockId!, 'json-program-root', 'OBJ');

  await clickBlockField(page, act, objectBlockId!, 'ADD_PAIR');

  await expect.poll(async () => await getBlockIdsByType(page, 'json_object_entry')).toHaveLength(1);
  await waitForGeneratedCodeSubstring(page, "['key']: 'value'");
});
