import {defineConfig} from '@playwright/test';


export default defineConfig({
  expect: {timeout: 10_000},
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  testDir: '../tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3333',
    trace: 'on-first-retry',
  },
  workers: 1,
});
