#!/usr/bin/env bash

set -euo pipefail

readonly root='charts/civil-citizen-ui/wiremock'
readonly port="${WIREMOCK_CONTRACT_PORT:-1121}"
readonly url="http://127.0.0.1:${port}"
readonly log_file="$(mktemp /tmp/cui-wiremock-contract.XXXXXX.log)"
wiremock_pid=''

cleanup() {
  if [ -n "${wiremock_pid}" ]; then kill "${wiremock_pid}" 2>/dev/null || true; fi
  rm -f "${log_file}"
}
trap cleanup EXIT INT TERM

./node_modules/.bin/wiremock --root-dir "${root}" --port "${port}" >"${log_file}" 2>&1 &
wiremock_pid=$!
for _ in $(seq 1 60); do
  curl --fail --silent "${url}/__admin/mappings" >/dev/null 2>&1 && break
  kill -0 "${wiremock_pid}" 2>/dev/null || { cat "${log_file}" >&2; exit 1; }
  sleep 1
done
curl --fail --silent "${url}/__admin/mappings" >/dev/null

assert_status() {
  local expected="$1" method="$2" endpoint="$3" body="${4:-}" actual
  actual=$(curl --silent --output /dev/null --write-out '%{http_code}' --request "${method}" \
    --header 'Content-Type: application/json' ${body:+--data "$body"} "${url}${endpoint}")
  if [ "${actual}" != "${expected}" ]; then
    echo "Expected ${method} ${endpoint} to return ${expected}, got ${actual}" >&2
    exit 1
  fi
}

assert_status 200 POST '/dashboard/scenarios/Scenario.AAA6.ClaimIssue.ClaimSubmit.Required/test-user' '{"params":{}}'
assert_status 200 POST '/fees/claim/total-amount' '{"totalClaimAmount":1385}'
assert_status 200 GET '/fees/claim/1385'
assert_status 200 GET '/fees/hearing/1385'
assert_status 200 POST '/cases/draft/citizen/test-user/event' '{"event":"CREATE_LIP_CLAIM","caseDataUpdate":{}}'
assert_status 200 GET '/cases/1111222233334444/userCaseRoles'
assert_status 200 GET '/cases/1111222233334444'
assert_status 200 GET '/search/places/v1/postcode?postcode=MK5%207HH'

# Significant match rules must leave incorrect requests unmatched.
assert_status 404 POST '/dashboard/scenarios/Scenario.WRONG/test-user' '{"params":{}}'
assert_status 404 POST '/fees/claim/total-amount' '{"amount":1385}'
assert_status 404 POST '/cases/draft/citizen/test-user/event' '{"event":"WRONG_EVENT"}'
assert_status 404 GET '/search/places/v1/postcode?postcode=SW1A%201AA'

echo 'WireMock complete-set startup and positive/negative contract checks passed.'
