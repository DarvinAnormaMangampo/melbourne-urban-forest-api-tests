import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never' }]],
  workers: 1,
  fullyParallel: false,
  retries: 0,
  maxFailures: 1,
  timeout: 45_000,
});
