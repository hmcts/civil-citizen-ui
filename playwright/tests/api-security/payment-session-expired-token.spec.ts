import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';
import { createExpiredJwt, createAlgNoneJwt, createFakeJwt } from '../../helpers/jwt-helper';

/**
 * DTSCCI-4177: Payment Session Security
 * Verify payment confirmation endpoints reject invalid/expired tokens.
 */
test.describe('Payment Confirmation - Expired & Invalid JWT', () => {
  const dummyClaimId = '1234567890123456';
  const expiredToken = createExpiredJwt();
  const algNoneToken = createAlgNoneJwt();
  const fakeToken = createFakeJwt();

  const paymentEndpoints = [
    { path: `/case/${dummyClaimId}/hearing-payment-confirmation`, description: 'Hearing Fee Confirmation' },
    { path: `/case/${dummyClaimId}/claim-issued-payment-confirmation`, description: 'Claim Fee Confirmation' },
    { path: `/case/${dummyClaimId}/general-application/payment-confirmation`, description: 'GA Fee Confirmation' },
  ];

  for (const endpoint of paymentEndpoints) {
    test(`${endpoint.description} - expired JWT returns 401/302`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint.path}`, {
        headers: {
          Cookie: `__auth-token=${expiredToken}`,
        },
        maxRedirects: 0,
      });
      expect([302, 401, 403]).toContain(response.status());
    });

    test(`${endpoint.description} - alg:none JWT returns 401/302`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint.path}`, {
        headers: {
          Cookie: `__auth-token=${algNoneToken}`,
        },
        maxRedirects: 0,
      });
      expect([302, 401, 403]).toContain(response.status());
    });

    test(`${endpoint.description} - fake JWT returns 401/302`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint.path}`, {
        headers: {
          Cookie: `__auth-token=${fakeToken}`,
        },
        maxRedirects: 0,
      });
      expect([302, 401, 403]).toContain(response.status());
    });
  }
});

test.describe('Payment Confirmation - No Auth', () => {
  const dummyClaimId = '1234567890123456';

  const paymentEndpoints = [
    { path: `/case/${dummyClaimId}/hearing-payment-confirmation`, description: 'Hearing Fee Confirmation' },
    { path: `/case/${dummyClaimId}/claim-issued-payment-confirmation`, description: 'Claim Fee Confirmation' },
    { path: `/case/${dummyClaimId}/general-application/payment-confirmation`, description: 'GA Fee Confirmation' },
  ];

  for (const endpoint of paymentEndpoints) {
    test(`${endpoint.description} - no auth redirects to login`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint.path}`, {
        maxRedirects: 0,
      });
      expect([302, 401, 403]).toContain(response.status());
    });
  }
});
