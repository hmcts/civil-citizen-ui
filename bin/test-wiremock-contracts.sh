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
assert_status 201 POST '/service-request' '{"case_reference":"000MC001","fees":[{"code":"FEE0209"}]}'
assert_status 201 POST '/service-request/2026-THIN-CLIENT-SERVICE-REQUEST/card-payments' '{"amount":455,"currency":"GBP","return-url":"https://example.test/claim-issued-payment-confirmation/1234"}'
assert_status 200 GET '/thin-pay/card?return_url=https%3A%2F%2Fexample.test%2Fclaim-issued-payment-confirmation%2F1234&amount=115.00'
assert_status 200 GET '/thin-pay/confirm?return_url=https%3A%2F%2Fexample.test%2Fclaim-issued-payment-confirmation%2F1234&amount=115.00'
assert_status 200 GET '/card-payments/RC-THIN-CLIENT-CLAIM/statuses'
assert_status 200 GET '/cases/documents/00000000-0000-4000-8000-000000000001'
assert_status 200 GET '/cases/documents/00000000-0000-4000-8000-000000000001/binary'
assert_status 204 DELETE '/cases/documents/00000000-0000-4000-8000-000000000001?permanent=true'
attach_response=$(curl --fail --silent --request PATCH \
  --header 'Content-Type: application/json' \
  --data '{"caseId":"1111222233334444","caseTypeId":"CIVIL","jurisdictionId":"CIVIL","documentHashTokens":[{"id":"00000000-0000-4000-8000-000000000001","hashToken":"thin-client-document-hash"}]}' \
  "${url}/cases/documents/attachToCase")
if [ "${attach_response}" != '{"Result":"SUCCESS"}' ]; then
  echo "Expected attach-to-case to return the CDAM response schema, got ${attach_response}" >&2
  exit 1
fi

upload_response=$(curl --fail --silent \
  --form 'classification=RESTRICTED' \
  --form 'caseTypeId=CIVIL' \
  --form 'jurisdictionId=CIVIL' \
  --form 'files=@charts/civil-citizen-ui/wiremock/__files/create-claim-claim-fee.json;type=application/pdf' \
  "${url}/cases/documents")
if ! grep --quiet 'dm-store-aat.service.core-compute-aat.internal/documents/00000000-0000-4000-8000-000000000001' <<<"${upload_response}"; then
  echo 'Expected multipart document upload to return a CCD-compatible DM Store link' >&2
  exit 1
fi

# Significant match rules must leave incorrect requests unmatched.
assert_status 404 POST '/dashboard/scenarios/Scenario.WRONG/test-user' '{"params":{}}'
assert_status 404 POST '/fees/claim/total-amount' '{"amount":1385}'
assert_status 404 POST '/cases/draft/citizen/test-user/event' '{"event":"WRONG_EVENT"}'
assert_status 404 GET '/search/places/v1/postcode?postcode=SW1A%201AA'
assert_status 404 POST '/service-request/2026-THIN-CLIENT-SERVICE-REQUEST/card-payments' '{"amount":115,"currency":"USD","return-url":"https://example.test/payment"}'
assert_status 404 GET '/card-payments/RC-UNKNOWN/statuses'
assert_status 404 POST '/cases/documents' '{}'
assert_status 404 PATCH '/cases/documents/attach-to-case' '{}'

echo 'WireMock complete-set startup and positive/negative contract checks passed.'
