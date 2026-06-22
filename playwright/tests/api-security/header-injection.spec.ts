import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';
import { createFakeJwt } from '../../helpers/jwt-helper';

/**
 * Header Injection: Verify spoofed headers cannot bypass authentication.
 */
test.describe('Header Spoofing - Auth Bypass Attempts', () => {
  const fakeToken = createFakeJwt();
  const dummyClaimId = '1234567890123456';
  const protectedUrl = `/case/${dummyClaimId}/hearing-payment-confirmation`;

  test('X-Forwarded-For: 127.0.0.1 does not bypass auth', async ({ request }) => {
    const response = await request.get(`${config.testUrl}${protectedUrl}`, {
      headers: {
        'X-Forwarded-For': '127.0.0.1',
        Cookie: `__auth-token=${fakeToken}`,
      },
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });

  test('X-Original-URL header does not bypass to health endpoint', async ({ request }) => {
    const response = await request.get(`${config.testUrl}${protectedUrl}`, {
      headers: {
        'X-Original-URL': '/health',
        Cookie: `__auth-token=${fakeToken}`,
      },
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });

  test('X-Rewrite-URL header does not bypass auth', async ({ request }) => {
    const response = await request.get(`${config.testUrl}${protectedUrl}`, {
      headers: {
        'X-Rewrite-URL': '/health',
        Cookie: `__auth-token=${fakeToken}`,
      },
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });

  test('X-Forwarded-Host: localhost does not bypass auth', async ({ request }) => {
    const response = await request.get(`${config.testUrl}${protectedUrl}`, {
      headers: {
        'X-Forwarded-Host': 'localhost',
        'X-Forwarded-For': '127.0.0.1',
        Cookie: `__auth-token=${fakeToken}`,
      },
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });

  test('Combined spoofed headers do not bypass auth', async ({ request }) => {
    const response = await request.get(`${config.testUrl}${protectedUrl}`, {
      headers: {
        'X-Real-IP': '127.0.0.1',
        'X-Forwarded-For': '127.0.0.1',
        'X-Original-URL': '/health',
        Cookie: `__auth-token=${fakeToken}`,
      },
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });
});
