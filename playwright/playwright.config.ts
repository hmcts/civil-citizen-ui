import { defineConfig } from '@playwright/test';
import os from 'node:os';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    [
      'allure-playwright',
      {
        resultsDir: 'test-results/security/allure-results',
        environmentInfo: {
          Environment: process.env.ENVIRONMENT || 'preview',
          TestUrl: process.env.TEST_URL || '',
          OS: os.platform(),
          Architecture: os.arch(),
          NodeVersion: process.version,
        },
      },
    ],
    ['junit', { outputFile: 'test-results/security/results.xml' }],
    ['list'],
  ],
  use: {
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  projects: [
    {
      name: 'api-security',
      testDir: './tests/api-security',
      fullyParallel: false,
      workers: 1,
    },
  ],
});
