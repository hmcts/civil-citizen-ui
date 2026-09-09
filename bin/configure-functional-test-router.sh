#!/bin/bash
set -euo pipefail

: "${WIREMOCK_DEPLOYMENT:?WIREMOCK_DEPLOYMENT must name the preview WireMock deployment}"

profile="${1:-}"

wiremock_curl() {
  local endpoint="$1"
  shift
  kubectl exec -n "${WIREMOCK_NAMESPACE:-civil}" "deployment/${WIREMOCK_DEPLOYMENT}" -- \
    curl --fail --silent --show-error "$@" "http://localhost:8080${endpoint}"
}

# Deployment readiness and Kubernetes API visibility can briefly differ. Keep
# this wait bounded and fail before changing mappings.
for attempt in $(seq 1 18); do
  if wiremock_curl '/__admin/mappings' >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 18 ]]; then
    echo "WireMock admin endpoint was not ready after 90 seconds" >&2
    exit 1
  fi
  sleep 5
done

case "$profile" in
  real)
    : "${REAL_CIVIL_SERVICE_URL:?REAL_CIVIL_SERVICE_URL must point to the preview Civil Service ingress}"
    wiremock_curl '/__admin/mappings' -X DELETE >/dev/null
    wiremock_curl '/__admin/mappings' -X POST \
      -H 'Content-Type: application/json' \
      -d "$(jq -n --arg target "$REAL_CIVIL_SERVICE_URL" '{priority: 100, request: {urlPattern: ".*"}, response: {proxyBaseUrl: $target}}')" >/dev/null
    ;;
  mocked)
    wiremock_curl '/__admin/mappings/reset' -X POST >/dev/null
    wiremock_curl '/__admin/requests' -X DELETE >/dev/null
    ;;
  *)
    echo "Usage: $0 real|mocked" >&2
    exit 2
    ;;
esac

echo "Functional-test router configured for the ${profile} profile"
