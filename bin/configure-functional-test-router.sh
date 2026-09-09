#!/bin/bash
set -euo pipefail

: "${WIREMOCK_URL:?WIREMOCK_URL must point to the preview WireMock ingress}"

profile="${1:-}"
case "$profile" in
  real)
    : "${REAL_CIVIL_SERVICE_URL:?REAL_CIVIL_SERVICE_URL must point to the preview Civil Service ingress}"
    curl --fail --silent --show-error -X DELETE "${WIREMOCK_URL}/__admin/mappings" >/dev/null
    curl --fail --silent --show-error -X POST \
      -H 'Content-Type: application/json' \
      -d "$(jq -n --arg target "$REAL_CIVIL_SERVICE_URL" '{priority: 100, request: {urlPattern: ".*"}, response: {proxyBaseUrl: $target}}')" \
      "${WIREMOCK_URL}/__admin/mappings" >/dev/null
    ;;
  mocked)
    curl --fail --silent --show-error -X POST "${WIREMOCK_URL}/__admin/mappings/reset" >/dev/null
    curl --fail --silent --show-error -X DELETE "${WIREMOCK_URL}/__admin/requests" >/dev/null
    ;;
  *)
    echo "Usage: $0 real|mocked" >&2
    exit 2
    ;;
esac

echo "Functional-test router configured for the ${profile} profile"
