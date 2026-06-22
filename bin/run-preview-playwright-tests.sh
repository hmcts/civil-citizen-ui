#!/bin/bash
set -ex

echo "================================================="
echo "  Running Playwright Preview Tests"
echo "  TEST_URL: ${TEST_URL}"
echo "================================================="

# No browser install needed — these are API-only tests
npx playwright test --config=playwright/playwright.config.ts --project=api-security

echo "================================================="
echo "  Playwright tests completed successfully"
echo "================================================="
