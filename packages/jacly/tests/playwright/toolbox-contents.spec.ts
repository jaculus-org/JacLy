import { expect } from '@playwright/test';
import { gotoTestApp, openToolboxCategory, waitForToolboxBlock } from './helpers';
import { test } from './test';

test('shows focused flyout contents for the selected category', async ({ page, act }) => {
  await gotoTestApp(page);
  await openToolboxCategory(page, act, 'Basic');
  await waitForToolboxBlock(page, 'basic_do_thing');

  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const testApi = (
          window as typeof window & {
            __jaclyTest: { getToolboxBlockTypes: () => string[] };
          }
        ).__jaclyTest;
        return testApi.getToolboxBlockTypes();
      });
    })
    .toEqual(['basic_do_thing']);
});
