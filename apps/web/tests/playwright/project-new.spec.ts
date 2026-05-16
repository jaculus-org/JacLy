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

  test('fills name, selects first template, and creates project', async ({ page }) => {
    await page.goto('/project/new?type=jacly');

    await expect(page.getByRole('heading', { name: /new project/i })).toBeVisible({
      timeout: 10000,
    });

    const nameInput = page.getByPlaceholder(/my awesome project/i);
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.fill('test-playwright-project');

    const firstTemplate = page
      .locator('#root')
      .getByRole('button')
      .filter({
        hasText: /template-/,
      })
      .first();
    await expect(firstTemplate).toBeVisible({ timeout: 15000 });
    await firstTemplate.click();

    const createBtn = page.getByRole('button', { name: /create project/i });
    await expect(createBtn).toBeEnabled({ timeout: 5000 });
    await createBtn.click();

    await expect(
      page.getByRole('button', { name: /creating/i }).or(page.locator('.blocklyMainBackground')),
    ).toBeAttached({ timeout: 30000 });
  });
});
