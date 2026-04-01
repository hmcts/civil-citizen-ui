import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * Error Handling: Verify error pages don't leak sensitive information.
 */
test.describe('Error Pages - No Information Leakage', () => {
  test('404 page does not expose stack trace', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/this-page-does-not-exist-12345`);
    const body = await response.text();
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('node_modules');
    expect(body).not.toContain('stack');
    expect(body).not.toContain('.ts:');
    expect(body).not.toContain('.js:');
  });

  test('Invalid case ID does not expose internal error details', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/case/invalid-id/hearing-payment-confirmation`, {
      maxRedirects: 0,
    });
    if (response.status() >= 400) {
      const body = await response.text();
      expect(body).not.toContain('node_modules');
      expect(body).not.toContain('TypeError');
      expect(body).not.toContain('postgres');
      expect(body).not.toContain('redis');
    }
  });

  test('Malformed URL does not expose file paths', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/%00%00%00`);
    const body = await response.text();
    expect(body).not.toContain('/opt/app/');
    expect(body).not.toContain('/home/');
    expect(body).not.toContain('src/main/');
  });
});

test.describe('Rate Limiting / Abuse Protection', () => {
  test('Rapid requests to login redirect do not cause 500', async ({ request }) => {
    const requests = Array.from({ length: 20 }, () =>
      request.get(`${config.testUrl}/dashboard`, { maxRedirects: 0 })
    );
    const responses = await Promise.all(requests);
    for (const response of responses) {
      expect(response.status()).not.toBe(500);
    }
  });

  test('Rapid requests to health endpoint remain stable', async ({ request }) => {
    const requests = Array.from({ length: 20 }, () =>
      request.get(`${config.testUrl}/health`)
    );
    const responses = await Promise.all(requests);
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
  });
});
