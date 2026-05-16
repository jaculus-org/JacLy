import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('hero section has create project CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /start new project/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /open recent projects/i })).toBeVisible();
  });

  test('template section renders headings', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  });

  test('header is visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'JacLy logo JacLy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
  });
});
