// Playwright E2E tests — run only via `npm run e2e`.
// Guard imports so the Playwright runner isn't loaded during `ng test` (unit runner).
type GlobalPlaywrightHelpers = { process?: { env?: Record<string, string> }; test?: { skip?: (name: string, fn: () => void) => void } | undefined };
const _env = (globalThis as GlobalPlaywrightHelpers).process?.env;
if (_env?.PLAYWRIGHT_RUN === '1' || _env?.PW_RUN === '1') {
  (async () => {
    const { test, expect } = await import('@playwright/test');

    test('Radio page opens', async ({ page }) => {
      await page.goto('/radio');
      await expect(page.getByText('Now playing')).toBeVisible();
    });

    test('Login page opens', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    });
  })();
} else {
  const globalTest = (globalThis as GlobalPlaywrightHelpers).test;
  if (typeof globalTest === 'object' && typeof globalTest?.skip === 'function') {
    globalTest.skip('playwright-only: smoke e2e', () => {});
  }
}
