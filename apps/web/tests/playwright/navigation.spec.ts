import { expect, test } from '@playwright/test';

test.describe('navigation', () => {
  test('navigates between pages via header links', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/project$/);

    await page.getByRole('link', { name: 'Docs' }).click();
    await expect(page).toHaveURL(/\/docs$/);

    await page.getByRole('link', { name: 'JacLy logo JacLy' }).click();
    await expect(page).toHaveURL('/');
  });

  test('project list page has create and import links', async ({ page }) => {
    await page.goto('/project/');

    await expect(page.getByRole('link', { name: 'Create' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Import' }).first()).toBeVisible();
  });
});
