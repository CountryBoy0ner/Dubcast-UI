import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run tests from the top-level `e2e-playwright/e2e` folder
  testDir: '../e2e-playwright/e2e',
  testMatch: ['**/*.e2e.spec.ts'],

  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    ignoreHTTPSErrors: true,
  },

  webServer: {
    command: 'npm run start -- --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
