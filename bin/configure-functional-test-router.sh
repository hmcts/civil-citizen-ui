#!/bin/bash
set -euo pipefail

: "${WIREMOCK_URL:?WIREMOCK_URL must point to the preview WireMock ingress}"

profile="${1:-}"

wiremock_curl() {
  curl --fail --silent --show-error \
    --retry 18 \
    --retry-delay 5 \
    --retry-all-errors \
    "$@"
}

# The preview ingress and its DNS record can become visible shortly after the
# pods report ready. Keep this wait bounded and fail before changing mappings.
wiremock_curl "${WIREMOCK_URL}/__admin/mappings" >/dev/null

case "$profile" in
  real)
    : "${REAL_CIVIL_SERVICE_URL:?REAL_CIVIL_SERVICE_URL must point to the preview Civil Service ingress}"
    wiremock_curl -X DELETE "${WIREMOCK_URL}/__admin/mappings" >/dev/null
    wiremock_curl -X POST \
      -H 'Content-Type: application/json' \
      -d "$(jq -n --arg target "$REAL_CIVIL_SERVICE_URL" '{priority: 100, request: {urlPattern: ".*"}, response: {proxyBaseUrl: $target}}')" \
      "${WIREMOCK_URL}/__admin/mappings" >/dev/null
    ;;
  mocked)
    wiremock_curl -X POST "${WIREMOCK_URL}/__admin/mappings/reset" >/dev/null
    wiremock_curl -X DELETE "${WIREMOCK_URL}/__admin/requests" >/dev/null
    ;;
  *)
    echo "Usage: $0 real|mocked" >&2
    exit 2
    ;;
esac

echo "Functional-test router configured for the ${profile} profile"
