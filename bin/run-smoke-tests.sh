#!/usr/bin/env bash

set -euo pipefail

if [ "${REDUCED_STACK_TESTS:-false}" != "true" ]; then
  yarn playwright install
  MOCHAWESOME_REPORTFILENAME=smokeTests \
    REPORT_DIR=test-results/smokeTest \
    codeceptjs run-workers --suites 1 --grep @smoketest --reporter mocha-multi --verbose
  exit $?
fi

: "${TEST_URL:?TEST_URL must point to the preview CUI ingress}"
: "${WIREMOCK_URL:?WIREMOCK_URL must point to the preview WireMock ingress}"

readonly output_dir='test-results/smokeTest'
mkdir -p "${output_dir}"

# The functional journey runs later on the same Jenkins agent. Do not rely on
# a browser left in the agent cache by an earlier build.
yarn playwright install chromium

check_health() {
  local name="$1"
  local url="$2"
  local output_file="${output_dir}/${name}-health.json"

  echo "Checking ${name} readiness at ${url}"
  curl --fail --silent --show-error \
    --retry 5 \
    --retry-delay 2 \
    --retry-all-errors \
    "${url}" \
    > "${output_file}"
}

check_health 'civil-citizen-ui' "${TEST_URL}/health"
check_health 'wiremock' "${WIREMOCK_URL}/health/readiness"

echo 'Reduced-stack preview health checks passed.'
