import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * XSS Injection: Verify script payloads in URL paths are not reflected in responses.
 */
test.describe('XSS Injection - Payment & Case URLs', () => {
  const xssPayloads = [
    { payload: '<script>alert(1)</script>', marker: '<script>' },
    { payload: '"><img src=x onerror=alert(1)>', marker: 'onerror=' },
    { payload: '%3Cscript%3Ealert(1)%3C%2Fscript%3E', marker: '%3Cscript%3E' },
    { payload: 'javascript:alert(\'XSS\')', marker: 'javascript:' },
  ];

  for (const { payload, marker } of xssPayloads) {
    test(`Case URL rejects XSS: ${marker}`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}/case/${encodeURIComponent(payload)}/hearing-payment-confirmation`, {
        maxRedirects: 0,
      });
      if (response.status() === 200) {
        const body = await response.text();
        expect(body).not.toContain(marker);
      }
    });

    test(`Dashboard URL rejects XSS: ${marker}`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}/dashboard/${encodeURIComponent(payload)}`, {
        maxRedirects: 0,
      });
      if (response.status() === 200) {
        const body = await response.text();
        expect(body).not.toContain(marker);
      }
    });
  }
});
