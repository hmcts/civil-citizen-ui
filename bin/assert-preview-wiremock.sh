#!/usr/bin/env bash

set -euo pipefail

: "${WIREMOCK_DEPLOYMENT:?WIREMOCK_DEPLOYMENT must name the preview WireMock deployment}"

wiremock_curl() {
  local endpoint="$1"
  shift
  kubectl exec -n "${WIREMOCK_NAMESPACE:-civil}" "deployment/${WIREMOCK_DEPLOYMENT}" -- \
    curl --fail --silent --show-error "$@" "http://localhost:8080${endpoint}"
}

readonly output_dir='test-results/functional/wiremock'
mkdir -p "${output_dir}"
readonly raw_dir="$(mktemp -d "${TMPDIR:-/tmp}/cui-wiremock-verification.XXXXXX")"
trap 'rm -rf "${raw_dir}"' EXIT

wiremock_curl '/__admin/requests' \
  > "${raw_dir}/all-requests.json"

wiremock_curl '/__admin/requests/unmatched' \
  > "${raw_dir}/unmatched-requests.json"

unmatched_count=$(jq '.requests | length' "${raw_dir}/unmatched-requests.json")
if [ "${unmatched_count}" -ne 0 ]; then
  echo "WireMock received ${unmatched_count} unmatched request(s)." >&2
  node src/test/functionalTests/diagnostics/collectWiremockDiagnostics.js
  jq '[((.body.requests // .requests)[]) | {method: (.method // .request.method), url: (.url // .request.url)}]' \
    "${output_dir}/unmatched-requests.json" >&2
  exit 1
fi

assert_request() {
  local description="$1"
  local pattern="$2"
  local response_file="$3"
  local count

  wiremock_curl '/__admin/requests/count' \
    --header 'Content-Type: application/json' \
    --data "${pattern}" \
    > "${output_dir}/${response_file}"
  count=$(jq -r '.count' "${output_dir}/${response_file}")
  if [ "${count}" -lt 1 ]; then
    echo "WireMock did not receive ${description}." >&2
    exit 1
  fi
}

if [ "${WIREMOCK_EXPECT_CREATE_CLAIM:-false}" = 'true' ]; then
  assert_request 'the claim-submission request' \
    '{"method":"POST","urlPattern":"/cases/draft/citizen/.*/event"}' \
    'claim-submission-count.json'
  assert_request 'the submitted-claim lookup' \
    '{"method":"GET","urlPath":"/cases/1111222233334444"}' \
    'claim-lookup-count.json'
fi

echo 'WireMock received no unmatched requests and all selected contract assertions passed.'
