#!/usr/bin/env bash

set -euo pipefail

: "${WIREMOCK_URL:?WIREMOCK_URL must point to the preview WireMock ingress}"

readonly output_dir='test-results/functional/wiremock'
mkdir -p "${output_dir}"

curl --fail --silent --show-error \
  "${WIREMOCK_URL}/__admin/requests/unmatched" \
  > "${output_dir}/unmatched-requests.json"

unmatched_count=$(jq '.requests | length' "${output_dir}/unmatched-requests.json")
if [ "${unmatched_count}" -ne 0 ]; then
  echo "WireMock received ${unmatched_count} unmatched request(s)." >&2
  jq '[.requests[] | {method: .request.method, url: .request.url}]' \
    "${output_dir}/unmatched-requests.json" >&2
  exit 1
fi

assert_request() {
  local description="$1"
  local pattern="$2"
  local response_file="$3"
  local count

  curl --fail --silent --show-error \
    --header 'Content-Type: application/json' \
    --data "${pattern}" \
    "${WIREMOCK_URL}/__admin/requests/count" \
    > "${output_dir}/${response_file}"
  count=$(jq -r '.count' "${output_dir}/${response_file}")
  if [ "${count}" -lt 1 ]; then
    echo "WireMock did not receive ${description}." >&2
    exit 1
  fi
}

assert_request 'the claim-submission request' \
  '{"method":"POST","urlPattern":"/cases/draft/citizen/.*/event"}' \
  'claim-submission-count.json'
assert_request 'the submitted-claim lookup' \
  '{"method":"GET","urlPath":"/cases/1111222233334444"}' \
  'claim-lookup-count.json'

echo 'WireMock received all expected requests and no unmatched requests.'
