import { expect, test } from '@playwright/test';

test('renders the JacLy home screen', async ({ page }) => {
  await page.goto('/');

  // await expect(
  //   page.getByRole('heading', { name: 'Web development environment for the Jaculus platform' }),
  // ).toBeVisible();
  // await expect(
  //   page.getByText(
  //     'JacLy is a web IDE for creating programs for ESP32 microcontrollers. Development can happen either in the visual blocks editor or as text written in TypeScript.',
  //   ),
  // ).toBeVisible();

  // await expect(page.getByText('Visual editor')).toBeVisible();
  // await expect(page.getByText('TypeScript text editor')).toBeVisible();
  // await expect(page.getByRole('heading', { name: 'Featured templates' })).toBeVisible();
  // await expect(page.getByRole('heading', { name: 'Recently opened projects' })).toBeVisible();
});
