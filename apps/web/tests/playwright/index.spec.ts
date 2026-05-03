import { expect, test } from '@playwright/test';

test('renders the JacLy home screen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: /^JacLy JacLy$/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Create projects with blocks or TypeScript.' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'JacLy is a browser IDE for Jaculus projects. Launch a blocks project, switch to TypeScript when you need it, and keep your recent work close by.',
    ),
  ).toBeVisible();

  await expect(page.getByText('Visual Blocks')).toBeVisible();
  await expect(page.getByText('TypeScript Code')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured templates' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent projects' })).toBeVisible();
  await expect(page.getByText(/^v0\.0\.1/)).toBeVisible();
});
