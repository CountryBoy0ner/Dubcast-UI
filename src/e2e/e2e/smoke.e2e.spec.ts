import { test, expect } from '@playwright/test';

test('Radio page opens', async ({ page }) => {
  await page.goto('/radio');
  await expect(page.getByText('Now playing')).toBeVisible();
});

test('Login page opens', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});
