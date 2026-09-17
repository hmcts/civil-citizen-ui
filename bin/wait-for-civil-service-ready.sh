#!/usr/bin/env bash
#
# Waits for civil-service (and, if set, ccd-data-store-api) to report healthy
# before the functional-test workers start hammering them with concurrent
# requests. Guards against the "bad record mac" TLS failures seen when 13
# workers all open their first connection at once against a still-starting
# preview pod.

set -euo pipefail

: "${CIVIL_SERVICE_URL:?CIVIL_SERVICE_URL must point to the preview civil-service ingress}"

readonly max_attempts="${READINESS_MAX_ATTEMPTS:-30}"
readonly retry_delay_seconds="${READINESS_RETRY_DELAY:-5}"

check_ready() {
  local name="$1"
  local url="$2"

  echo "Waiting for ${name} readiness at ${url}"
  curl --fail --silent --show-error \
    --max-time 10 \
    --retry "${max_attempts}" \
    --retry-delay "${retry_delay_seconds}" \
    --retry-all-errors \
    --output /dev/null \
    "${url}"
  echo "${name} is ready."
}

check_ready 'civil-service' "${CIVIL_SERVICE_URL}/health"

if [ -n "${CCD_DATA_STORE_URL:-}" ]; then
  check_ready 'ccd-data-store-api' "${CCD_DATA_STORE_URL}/health"
fi

echo 'Preview backend readiness checks passed - safe to start functional test workers.'
