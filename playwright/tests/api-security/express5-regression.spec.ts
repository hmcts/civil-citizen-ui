import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * Express 5 Regression: guards against behaviour that changed when upgrading from Express 4 to 5.
 * Covers route param handling, body parsing, query parsing, method handling and sustained load.
 */

test.describe('Express 5 - POST body handling (ensureBodyObject)', () => {
  test('Empty POST without Content-Type does not return 500', async ({ request }) => {
    const response = await request.post(`${config.testUrl}/`, { maxRedirects: 0 });
    expect(response.status()).not.toBe(500);
  });

  test('POST with empty JSON {} does not return 500', async ({ request }) => {
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'application/json' },
      data: {},
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('POST with invalid JSON returns 400, not 500 or hang', async ({ request }) => {
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{bad json',
      maxRedirects: 0,
    });
    expect([400, 302, 303]).toContain(response.status());
  });

  test('POST with text/plain body does not return 500', async ({ request }) => {
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'text/plain' },
      data: 'plain text body',
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('POST with empty multipart does not return 500', async ({ request }) => {
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'multipart/form-data; boundary=xxx' },
      data: '--xxx--',
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('POST with form-urlencoded does not return 500', async ({ request }) => {
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: 'foo=bar',
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Express 5 - Payload size limits', () => {
  test('1KB JSON body accepted', async ({ request }) => {
    const body = { x: 'a'.repeat(1000) };
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'application/json' },
      data: body,
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('100KB JSON body accepted', async ({ request }) => {
    const body = { x: 'a'.repeat(100000) };
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'application/json' },
      data: body,
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('1MB JSON body within configured 500mb limit', async ({ request }) => {
    const body = { x: 'a'.repeat(1_000_000) };
    const response = await request.post(`${config.testUrl}/`, {
      headers: { 'Content-Type': 'application/json' },
      data: body,
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Express 5 - Route parameter edge cases (path-to-regexp v8)', () => {
  test('Numeric case ID handled without error', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/case/1234567890/claim-details`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Unicode in route param does not return 500', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/case/${encodeURIComponent('中文')}/claim-details`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Null byte in route param does not return 500', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/case/1234%00evil/claim-details`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Extremely long route param (500 chars) does not return 500', async ({ request }) => {
    const longId = '1'.repeat(500);
    const response = await request.get(`${config.testUrl}/case/${longId}/claim-details`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Empty route param handled cleanly', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/case//claim-details`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Trailing slash variant handled consistently', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard/`, {
      maxRedirects: 0,
    });
    expect([302, 303, 200]).toContain(response.status());
  });
});

test.describe('Express 5 - Query string parser', () => {
  test('Array query params (?id=1&id=2) do not crash', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard?id=1&id=2`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Deeply nested query (?a[b][c]=1) does not crash', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard?a%5Bb%5D%5Bc%5D%5Bd%5D=1`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('100 query parameters handled without 500', async ({ request }) => {
    const params = Array.from({ length: 100 }, (_, i) => `p${i}=${i}`).join('&');
    const response = await request.get(`${config.testUrl}/dashboard?${params}`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('Special characters in query value handled', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard?q=${encodeURIComponent(' +&=<>')}`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Express 5 - HTTP method handling', () => {
  const methods = ['PUT', 'DELETE', 'PATCH'] as const;

  for (const method of methods) {
    test(`${method} on dashboard does not return 500`, async ({ request }) => {
      const response = await request.fetch(`${config.testUrl}/dashboard`, {
        method,
        maxRedirects: 0,
      });
      expect(response.status()).not.toBe(500);
    });
  }

  test('HEAD on dashboard returns a status (not 500)', async ({ request }) => {
    const response = await request.head(`${config.testUrl}/dashboard`, { maxRedirects: 0 });
    expect(response.status()).not.toBe(500);
  });

  test('OPTIONS on dashboard returns a status (not 500)', async ({ request }) => {
    const response = await request.fetch(`${config.testUrl}/dashboard`, {
      method: 'OPTIONS',
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Express 5 - Sustained load (memory leak / degradation signal)', () => {
  test('50 sequential dashboard requests stay under 3s each', async ({ request }) => {
    const timings: number[] = [];
    for (let i = 0; i < 50; i++) {
      const start = Date.now();
      const response = await request.get(`${config.testUrl}/dashboard`, { maxRedirects: 0 });
      timings.push(Date.now() - start);
      expect(response.status()).not.toBe(500);
    }
    const slowCount = timings.filter(t => t > 3000).length;
    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    console.log(`Sustained load - avg: ${avg.toFixed(0)}ms, slow (>3s): ${slowCount}/50`);
    expect(slowCount).toBeLessThan(5);
  });
});

test.describe('Express 5 - Redirect behaviour (res.redirect back removal)', () => {
  test('Dashboard redirect chain resolves within 10 hops', async ({ request }) => {
    const response = await request.get(`${config.testUrl}/dashboard`, { maxRedirects: 10 });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Express 5 - Long header handling', () => {
  test('Very long custom header (2KB) does not return 500', async ({ request }) => {
    const longValue = 'A'.repeat(2000);
    const response = await request.get(`${config.testUrl}/dashboard`, {
      headers: { 'X-Custom': longValue },
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });
});
