import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';
import { createRoleEscalationJwt } from '../../helpers/jwt-helper';

/**
 * DTSCCI-4177: Payment Session Isolation
 * Verify fee type isolation, role escalation rejection,
 * and HTTP method tampering on payment endpoints.
 */
test.describe('Payment Session - Role Escalation', () => {
  const dummyClaimId = '1234567890123456';
  const escalatedToken = createRoleEscalationJwt();

  const paymentEndpoints = [
    { path: `/case/${dummyClaimId}/hearing-payment-confirmation`, description: 'Hearing Fee' },
    { path: `/case/${dummyClaimId}/claim-issued-payment-confirmation`, description: 'Claim Fee' },
    { path: `/case/${dummyClaimId}/general-application/payment-confirmation`, description: 'GA Fee' },
  ];

  for (const endpoint of paymentEndpoints) {
    test(`${endpoint.description} - role escalation JWT rejected`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint.path}`, {
        headers: {
          Cookie: `__auth-token=${escalatedToken}`,
        },
        maxRedirects: 0,
      });
      expect(response.status()).not.toBe(200);
    });
  }
});

test.describe('Payment Session - HTTP Method Tampering', () => {
  const dummyClaimId = '1234567890123456';

  const paymentEndpoints = [
    `/case/${dummyClaimId}/hearing-payment-confirmation`,
    `/case/${dummyClaimId}/claim-issued-payment-confirmation`,
    `/case/${dummyClaimId}/general-application/payment-confirmation`,
  ];

  const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  for (const endpoint of paymentEndpoints) {
    for (const method of methods) {
      test(`${method} ${endpoint.split('/').pop()} must not return 200`, async ({ request }) => {
        const response = await request.fetch(`${config.testUrl}${endpoint}`, {
          method,
          maxRedirects: 0,
        });
        expect(response.status()).not.toBe(200);
      });
    }
  }
});

test.describe('Payment Fee URL - Fee Type Validation', () => {
  const dummyClaimId = '1234567890123456';

  // These are the valid fee type paths — anything else should fail
  const invalidFeePaths = [
    `/case/${dummyClaimId}/invalid-fee-payment-confirmation`,
    `/case/${dummyClaimId}/admin-payment-confirmation`,
    `/case/${dummyClaimId}/../hearing-payment-confirmation`,
  ];

  for (const path of invalidFeePaths) {
    test(`Invalid fee path rejected: ${path.split('/').pop()}`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${path}`, {
        maxRedirects: 0,
      });
      expect(response.status()).not.toBe(200);
    });
  }
});
