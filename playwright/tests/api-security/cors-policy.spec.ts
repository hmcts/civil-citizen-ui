import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * CORS Policy: Verify the app doesn't allow arbitrary cross-origin access.
 */
test.describe('CORS Policy', () => {
  test('Does not allow arbitrary origin', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`, {
      headers: {
        Origin: 'https://evil-site.com',
      },
    });
    const allowOrigin = response.headers()['access-control-allow-origin'] || '';
    expect(allowOrigin).not.toBe('*');
    expect(allowOrigin).not.toContain('evil-site.com');
  });

  test('Does not reflect arbitrary origin in CORS header', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`, {
      headers: {
        Origin: 'https://attacker.com',
      },
    });
    const allowOrigin = response.headers()['access-control-allow-origin'] || '';
    expect(allowOrigin).not.toContain('attacker.com');
  });

  test('Does not allow credentials from arbitrary origin', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`, {
      headers: {
        Origin: 'https://evil-site.com',
      },
    });
    const allowCredentials = response.headers()['access-control-allow-credentials'] || '';
    const allowOrigin = response.headers()['access-control-allow-origin'] || '';
    // If credentials are allowed, origin must not be wildcard or attacker-controlled
    if (allowCredentials === 'true') {
      expect(allowOrigin).not.toBe('*');
      expect(allowOrigin).not.toContain('evil-site.com');
    }
  });
});
