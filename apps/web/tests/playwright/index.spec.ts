import { expect, test } from '@playwright/test';

test('renders the JacLy home screen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'JacLy logo JacLy' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();

  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
});
