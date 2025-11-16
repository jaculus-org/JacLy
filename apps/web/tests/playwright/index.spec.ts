import { test, expect } from '@playwright/test';

test('has title Welcome to JacLy', async ({ page }) => {
  await page.goto('/');

  // Expect the page to have a heading with "Welcome to JacLy".
  await expect(
    page.getByRole('heading', { name: 'Welcome to JacLy' })
  ).toBeVisible();
});
