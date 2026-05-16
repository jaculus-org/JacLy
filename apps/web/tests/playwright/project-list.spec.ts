import { expect, test } from '@playwright/test';

test.describe('project list page', () => {
  test('page renders with header and actions', async ({ page }) => {
    await page.goto('/project/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Create' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Import' }).first()).toBeVisible();
  });
});
