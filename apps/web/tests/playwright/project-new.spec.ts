import { expect, test } from '@playwright/test';

test.describe('project new page', () => {
  test('renders heading and header', async ({ page }) => {
    await page.goto('/project/new');

    await expect(page.getByRole('heading', { name: /new project/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('link', { name: 'JacLy logo JacLy' })).toBeVisible();
  });

  test('renders with type from search params', async ({ page }) => {
    await page.goto('/project/new?type=code');

    await expect(page.getByRole('heading', { name: /new project/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
