import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * Security Headers: Verify the application returns proper security headers.
 * OWASP recommended headers to prevent clickjacking, XSS, MIME sniffing, etc.
 */
test.describe('Security Headers', () => {
  test('Response includes X-Frame-Options', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`);
    const header = response.headers()['x-frame-options'];
    expect(header).toBeDefined();
    expect(['DENY', 'SAMEORIGIN']).toContain(header);
  });

  test('Response includes X-Content-Type-Options: nosniff', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('Response includes Strict-Transport-Security', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`);
    const hsts = response.headers()['strict-transport-security'];
    expect(hsts).toBeDefined();
  });

  test('Response includes X-XSS-Protection header', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`);
    const header = response.headers()['x-xss-protection'];
    // X-XSS-Protection: 0 is valid (modern best practice when CSP is present)
    // X-XSS-Protection: 1 is also acceptable
    expect(header).toBeDefined();
  });

  test('Response does not expose server version', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`);
    const server = response.headers()['server'] || '';
    // Should not expose exact version like "Express/4.18.2"
    expect(server).not.toMatch(/\d+\.\d+\.\d+/);
  });

  test('Response does not expose X-Powered-By', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/health`);
    expect(response.headers()['x-powered-by']).toBeUndefined();
  });
});

test.describe('Cookie Security', () => {
  test('Session cookie has Secure flag on login redirect', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard`, {
      maxRedirects: 0,
    });
    const setCookie = response.headers()['set-cookie'] || '';
    if (setCookie.includes('connect.sid') || setCookie.includes('session')) {
      expect(setCookie.toLowerCase()).toContain('secure');
    }
  });

  test('Session cookie has HttpOnly flag', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard`, {
      maxRedirects: 0,
    });
    const setCookie = response.headers()['set-cookie'] || '';
    if (setCookie.includes('connect.sid') || setCookie.includes('session')) {
      expect(setCookie.toLowerCase()).toContain('httponly');
    }
  });
});

test.describe('Cache Control', () => {
  test('Protected pages set no-cache headers', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard`, {
      maxRedirects: 0,
    });
    const cacheControl = response.headers()['cache-control'] || '';
    // Should not cache authenticated pages
    if (response.status() === 200) {
      expect(cacheControl).toMatch(/no-cache|no-store|private/);
    }
  });
});
