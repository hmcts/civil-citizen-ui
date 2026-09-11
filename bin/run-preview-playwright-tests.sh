#!/bin/bash
set -ex

: "${TEST_URL:?TEST_URL must point to the preview deployment}"

# External DNS can briefly disappear while preview records converge. Wait for
# the same public endpoint exercised by the tests instead of producing a large
# batch of misleading ENOTFOUND failures.
wait_for_preview() {
  local preview_ready=false
  local attempt

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
    return 1
  fi
}

wait_for_preview

echo "================================================="
echo "  Running Playwright Preview Tests"
echo "  TEST_URL: ${TEST_URL}"
echo "================================================="

# No browser install needed — these are API-only tests. Retry the suite once
# only when preview DNS disappeared during execution; assertion failures remain
# authoritative and are not retried here.
mkdir -p test-results/security
security_log='test-results/security/playwright-output.log'
set +e
npx playwright test --config=playwright/playwright.config.ts --project=api-security 2>&1 | tee "$security_log"
security_exit=${PIPESTATUS[0]}
set -e

if [[ "$security_exit" -ne 0 ]] && grep -q 'getaddrinfo ENOTFOUND' "$security_log"; then
  echo 'Preview DNS disappeared during the API security suite; waiting and retrying once.'
  wait_for_preview
  npx playwright test --config=playwright/playwright.config.ts --project=api-security
elif [[ "$security_exit" -ne 0 ]]; then
  exit "$security_exit"
fi

echo "================================================="
echo "  Playwright tests completed successfully"
echo "================================================="
