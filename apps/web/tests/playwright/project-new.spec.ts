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

  test('fills name, selects template, creates project, and opens editor', async ({ page }) => {
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
      .filter({ hasText: /template-/ })
      .first();
    await expect(firstTemplate).toBeVisible({ timeout: 15000 });
    await firstTemplate.click();

    const createBtn = page.getByRole('button', { name: /create project/i });
    await expect(createBtn).toBeEnabled({ timeout: 5000 });
    await createBtn.click();

    await expect(page.getByRole('button', { name: /creating/i })).toBeAttached({
      timeout: 10000,
    });

    await expect(page).toHaveURL(/\/project\//, { timeout: 30000 });

    await expect(page.getByRole('link', { name: 'Projects', exact: true })).not.toBeAttached({
      timeout: 5000,
    });

    await page.locator('svg.lucide-loader-2').waitFor({ state: 'hidden', timeout: 30000 });

    await expect(page.locator('.blocklyMainBackground')).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /test-playwright-project/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
    await expect(page.getByText('File Explorer').first()).toBeVisible();
  });
});
