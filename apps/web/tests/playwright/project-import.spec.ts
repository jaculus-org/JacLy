import { expect, test } from '@playwright/test';

test.describe('project import page', () => {
  test('renders heading and tabs', async ({ page }) => {
    await page.goto('/project/import');

    await expect(page.getByRole('heading', { name: /import/i })).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByRole('tab', { name: 'File' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'URL' })).toBeVisible();
  });

  test('submit button is disabled initially', async ({ page }) => {
    await page.goto('/project/import');

    await expect(page.getByRole('button', { name: /import/i }).first()).toBeDisabled({
      timeout: 10000,
    });
  });
});
