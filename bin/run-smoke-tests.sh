#!/usr/bin/env bash

set -euo pipefail

yarn playwright install
MOCHAWESOME_REPORTFILENAME=smokeTests \
  REPORT_DIR=test-results/smokeTest \
  codeceptjs run-workers --suites 1 --grep @smoketest --reporter mocha-multi --verbose

if [ "${OPTIMISED_FUNCTIONAL_TESTS:-false}" != "true" ]; then
  exit 0
fi

: "${TEST_URL:?TEST_URL must point to the preview CUI ingress}"
: "${WIREMOCK_DEPLOYMENT:?WIREMOCK_DEPLOYMENT must name the preview WireMock deployment}"

readonly output_dir='test-results/smokeTest'
mkdir -p "${output_dir}"

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
kubectl exec -n "${WIREMOCK_NAMESPACE:-civil}" "deployment/${WIREMOCK_DEPLOYMENT}" -- \
  curl --fail --silent --show-error http://localhost:8080/health/readiness \
  > "${output_dir}/wiremock-health.json"

echo 'Optimised preview router health checks passed.'
