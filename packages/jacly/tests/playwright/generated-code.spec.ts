import { expect } from '@playwright/test';
import {
  dragToolboxBlockToInput,
  expectBlockCount,
  gotoTestApp,
  openToolboxCategory,
  waitForGeneratedCodeSubstring,
  waitForToolboxBlock,
} from './helpers';
import { test } from './test';

test('emits generated code containing the dragged block output', async ({ page, act }) => {
  await gotoTestApp(page, 'codegen');
  await openToolboxCategory(page, act, 'Basic');
  await waitForToolboxBlock(page, 'basic_value');
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const testApi = (
          window as typeof window & {
            __jaclyTest: { hasGeneratorForBlockType: (blockType: string) => boolean };
          }
        ).__jaclyTest;
        return (
          testApi.hasGeneratorForBlockType('basic_value') &&
          testApi.hasGeneratorForBlockType('basic_program')
        );
      });
    })
    .toBe(true);
  await dragToolboxBlockToInput(page, act, 'basic_value', 'program-root', 'VALUE');
  await expectBlockCount(page, 2);
  await waitForGeneratedCodeSubstring(page, 'emit(42);');
});
