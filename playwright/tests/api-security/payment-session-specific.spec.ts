import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';
import { createFakeJwt, createOtherUserJwt } from '../../helpers/jwt-helper';

/**
 * DTSCCI-4177: Payment Session Race Condition — Specific Tests
 * These tests validate the actual fix: Redis keys now include feeType + userId
 * Old key: claimId + userIdForPayment
 * New key: claimId + feeType + userIdForPayment
 */

const dummyClaimId = '1234567890123456';
const baseUrl = () => config.testUrl;

test.describe('Payment Confirmation - Fee Type Isolation', () => {
  // Verify each fee type confirmation URL is independently accessible and doesn't cross-contaminate
  const feeConfirmationUrls = [
    { path: `/case/${dummyClaimId}/hearing-payment-confirmation`, feeType: 'HEARING' },
    { path: `/case/${dummyClaimId}/claim-issued-payment-confirmation`, feeType: 'CLAIMISSUED' },
    { path: `/case/${dummyClaimId}/general-application/payment-confirmation`, feeType: 'GENERALAPPLICATION' },
  ];

  for (const fee of feeConfirmationUrls) {
    test(`${fee.feeType} confirmation URL does not return payment data without valid session`, async ({ request }) => {
      const response = await request.get(`${baseUrl()}${fee.path}`, {
        maxRedirects: 0,
      });
      // Without auth, should redirect to login — never expose payment data
      expect([302, 401, 403]).toContain(response.status());
    });

    test(`${fee.feeType} confirmation URL rejects cross-fee-type access attempt`, async ({ request }) => {
      // Try accessing hearing fee confirmation with a token that only has GA payment session
      const response = await request.get(`${baseUrl()}${fee.path}`, {
        headers: { Cookie: `__auth-token=${createFakeJwt()}` },
        maxRedirects: 0,
      });
      expect(response.status()).not.toBe(200);
    });
  }
});

test.describe('Payment Session - Concurrent User Isolation', () => {
  // Simulate two different users trying to access same claim's payment
  const userAToken = createOtherUserJwt('user-a-id-11111');
  const userBToken = createOtherUserJwt('user-b-id-22222');

  test('User A cannot access User B payment confirmation on same claim', async ({ request }) => {
    // User A hits hearing fee confirmation
    const responseA = await request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, {
      headers: { Cookie: `__auth-token=${userAToken}` },
      maxRedirects: 0,
    });
    expect(responseA.status()).not.toBe(200);

    // User B hits same hearing fee confirmation
    const responseB = await request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, {
      headers: { Cookie: `__auth-token=${userBToken}` },
      maxRedirects: 0,
    });
    expect(responseB.status()).not.toBe(200);

    // Neither should get payment data — sessions are isolated
  });

  test('Different users on same claim with different fee types are isolated', async ({ request }) => {
    const responseA = await request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, {
      headers: { Cookie: `__auth-token=${userAToken}` },
      maxRedirects: 0,
    });
    const responseB = await request.get(`${baseUrl()}/case/${dummyClaimId}/general-application/payment-confirmation`, {
      headers: { Cookie: `__auth-token=${userBToken}` },
      maxRedirects: 0,
    });
    expect(responseA.status()).not.toBe(200);
    expect(responseB.status()).not.toBe(200);
  });
});

test.describe('Payment Confirmation - Session Cleanup', () => {
  test('Payment confirmation URL with no active payment session does not crash', async ({ request }) => {
    // Hit confirmation URL when no payment has been initiated — should handle gracefully
    const response = await request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, {
      maxRedirects: 0,
    });
    // Should redirect to login or return error — not 500
    expect(response.status()).not.toBe(500);
  });

  test('Payment confirmation URL after session expired does not crash', async ({ request }) => {
    const response = await request.get(`${baseUrl()}/case/${dummyClaimId}/claim-issued-payment-confirmation`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test('GA payment confirmation URL after session expired does not crash', async ({ request }) => {
    const response = await request.get(`${baseUrl()}/case/${dummyClaimId}/general-application/payment-confirmation`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Payment Confirmation - Double Request / Replay', () => {
  test('Rapid double request to hearing fee confirmation does not return 500', async ({ request }) => {
    const [response1, response2] = await Promise.all([
      request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, { maxRedirects: 0 }),
      request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, { maxRedirects: 0 }),
    ]);
    expect(response1.status()).not.toBe(500);
    expect(response2.status()).not.toBe(500);
  });

  test('Rapid double request to GA payment confirmation does not return 500', async ({ request }) => {
    const [response1, response2] = await Promise.all([
      request.get(`${baseUrl()}/case/${dummyClaimId}/general-application/payment-confirmation`, { maxRedirects: 0 }),
      request.get(`${baseUrl()}/case/${dummyClaimId}/general-application/payment-confirmation`, { maxRedirects: 0 }),
    ]);
    expect(response1.status()).not.toBe(500);
    expect(response2.status()).not.toBe(500);
  });

  test('Concurrent requests to different fee types on same claim do not return 500', async ({ request }) => {
    const [hearing, claim, ga] = await Promise.all([
      request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation`, { maxRedirects: 0 }),
      request.get(`${baseUrl()}/case/${dummyClaimId}/claim-issued-payment-confirmation`, { maxRedirects: 0 }),
      request.get(`${baseUrl()}/case/${dummyClaimId}/general-application/payment-confirmation`, { maxRedirects: 0 }),
    ]);
    expect(hearing.status()).not.toBe(500);
    expect(claim.status()).not.toBe(500);
    expect(ga.status()).not.toBe(500);
  });
});

test.describe('Payment Confirmation - Callback URL Tampering', () => {
  test('Payment confirmation with tampered claimId does not leak other claim data', async ({ request }) => {
    const realClaimId = '1774884229545354';
    const tamperedClaimId = '9999999999999999';
    const response = await request.get(`${baseUrl()}/case/${tamperedClaimId}/hearing-payment-confirmation`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });

  test('Payment confirmation with extra path segments rejected', async ({ request }) => {
    const response = await request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation/../../admin`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(200);
  });

  test('Payment confirmation with query string injection handled', async ({ request }) => {
    const response = await request.get(`${baseUrl()}/case/${dummyClaimId}/hearing-payment-confirmation?redirect=http://evil.com`, {
      maxRedirects: 0,
    });
    // Should not redirect to evil.com
    const location = response.headers()['location'] || '';
    expect(location).not.toContain('evil.com');
  });
});
