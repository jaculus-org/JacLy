import { expect, test } from '@playwright/test';

test('displays 404 page with navigation options', async ({ page }) => {
  await page.goto('/nonexistent-page');

  await expect(page.getByText('404')).toBeVisible();

  await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
});
