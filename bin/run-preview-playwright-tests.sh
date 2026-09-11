#!/bin/bash
set -ex

: "${TEST_URL:?TEST_URL must point to the preview deployment}"

# External DNS can briefly disappear while preview records converge. Wait for
# the same public endpoint exercised by the tests instead of producing a large
# batch of misleading ENOTFOUND failures.
preview_ready=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 10 "${TEST_URL}/health" >/dev/null; then
    preview_ready=true
    break
  fi
  echo "Preview endpoint is not resolvable/ready (attempt ${attempt}/30); retrying in 10 seconds"
  sleep 10
done

if [[ "$preview_ready" != "true" ]]; then
  echo "Preview endpoint did not become resolvable and healthy within 5 minutes: ${TEST_URL}" >&2
  exit 1
fi

echo "================================================="
echo "  Running Playwright Preview Tests"
echo "  TEST_URL: ${TEST_URL}"
echo "================================================="

# No browser install needed — these are API-only tests
npx playwright test --config=playwright/playwright.config.ts --project=api-security

echo "================================================="
echo "  Playwright tests completed successfully"
echo "================================================="
