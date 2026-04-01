import { test, expect } from '@playwright/test';
import { config } from '../../helpers/env-config';

/**
 * SQL Injection: Verify SQL payloads in claimId do not cause 500 errors.
 * A 500 may indicate unhandled SQL reaching the database.
 */
test.describe('SQL Injection - Case URLs', () => {
  const sqlPayloads = [
    "' OR '1'='1",
    "1; DROP TABLE claims;--",
    "' UNION SELECT * FROM users--",
    "1' AND 1=1--",
    "' HAVING 1=1--",
    "' ORDER BY 100--",
    "1; EXEC xp_cmdshell('whoami')--",
    "CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))",
    "' OR 1=1; WAITFOR DELAY '0:0:5'--",
    "1' AND (SELECT COUNT(*) FROM users) > 0--",
  ];

  for (const payload of sqlPayloads) {
    test(`Case URL rejects SQL: ${payload.substring(0, 40)}`, async ({ request }) => {
      const response = await request.get(`${config.testUrl}/case/${encodeURIComponent(payload)}/hearing-payment-confirmation`, {
        maxRedirects: 0,
      });
      expect(response.status()).not.toBe(500);
    });
  }
});
