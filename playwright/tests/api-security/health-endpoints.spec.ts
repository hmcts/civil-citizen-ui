import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * Health Endpoints: Verify public health endpoints return 200 without auth.
 * Sanity check that whitelisted endpoints are accessible.
 */
test.describe('Health Endpoints - Public Access', () => {
  const healthEndpoints = [
    '/health',
    '/health/liveness',
    '/health/readiness',
  ];

  for (const endpoint of healthEndpoints) {
    test(`GET ${endpoint} returns 200 without auth`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint}`);
      expect(response.status()).toBe(200);
    });
  }
});
