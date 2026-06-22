import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';
import { createOtherUserJwt } from '../../helpers/jwt-helper';

/**
 * DTSCCI-4177: Payment Session IDOR
 * Verify one user cannot access another user's payment confirmation.
 * A forged token with a different userId should not return payment data.
 */
test.describe('Payment Session - IDOR / Cross-User Isolation', () => {
  const dummyClaimId = '1234567890123456';
  const otherUserToken = createOtherUserJwt('attacker-user-id-99999');

  const paymentEndpoints = [
    { path: `/case/${dummyClaimId}/hearing-payment-confirmation`, description: 'Hearing Fee' },
    { path: `/case/${dummyClaimId}/claim-issued-payment-confirmation`, description: 'Claim Fee' },
    { path: `/case/${dummyClaimId}/general-application/payment-confirmation`, description: 'GA Fee' },
  ];

  for (const endpoint of paymentEndpoints) {
    test(`${endpoint.description} - forged userId token cannot access payment session`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}${endpoint.path}`, {
        headers: {
          Cookie: `__auth-token=${otherUserToken}`,
        },
        maxRedirects: 0,
      });
      // Should not return 200 with payment data
      expect(response.status()).not.toBe(200);
    });
  }
});

test.describe('Payment Session - Path Traversal on claimId', () => {
  const maliciousClaimIds = [
    '../../../etc/passwd',
    '1234567890123456/../admin',
    '1234567890123456%00admin',
    '<script>alert(1)</script>',
    '1234567890123456\' OR 1=1--',
  ];

  for (const claimId of maliciousClaimIds) {
    test(`Hearing fee confirmation rejects malicious claimId: ${claimId.substring(0, 30)}`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}/case/${encodeURIComponent(claimId)}/hearing-payment-confirmation`, {
        maxRedirects: 0,
      });
      expect(response.status()).not.toBe(200);
    });
  }
});
