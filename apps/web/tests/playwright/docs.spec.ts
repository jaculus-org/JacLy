import { expect, test } from '@playwright/test';

test.describe('docs page', () => {
  test('renders the docs layout with sidebar', async ({ page }) => {
    await page.goto('/docs/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test('navigates to a docs page', async ({ page }) => {
    await page.goto('/docs/faq');

    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });
});
