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
assert_status 200 GET '/fees-register/fees/lookup?service=other&jurisdiction1=civil&jurisdiction2=civil&channel=default&event=miscellaneous&keyword=AppnToVaryOrSuspend'
assert_status 200 POST '/cases/draft/citizen/test-user/event' '{"event":"CREATE_LIP_CLAIM","caseDataUpdate":{}}'
assert_status 200 GET '/cases/1111222233334444/userCaseRoles'
assert_status 200 GET '/cases/1111222233334444'
assert_status 200 GET '/search/places/v1/postcode?postcode=MK5%207HH'
service_request_body='{"case_reference":"000MC001","fees":[{"code":"FEE0209"}]}'
service_request_response=$(curl --fail --silent --request POST --header 'Content-Type: application/json' --data "${service_request_body}" "${url}/service-request")
second_service_request_response=$(curl --fail --silent --request POST --header 'Content-Type: application/json' --data "${service_request_body}" "${url}/service-request")
service_request_reference=$(node -e 'console.log(JSON.parse(process.argv[1]).service_request_reference)' "${service_request_response}")
second_service_request_reference=$(node -e 'console.log(JSON.parse(process.argv[1]).service_request_reference)' "${second_service_request_response}")
if [ "${service_request_reference}" = "${second_service_request_reference}" ]; then
  echo 'Expected each service request to return a unique reference' >&2
  exit 1
fi
payment_body='{"amount":455,"currency":"GBP","return-url":"https://example.test/claim-issued-payment-confirmation/1234"}'
payment_response=$(curl --fail --silent --request POST --header 'Content-Type: application/json' --data "${payment_body}" "${url}/service-request/2026-THIN-CLIENT-SERVICE-REQUEST/card-payments")
payment_reference=$(node -e 'console.log(JSON.parse(process.argv[1]).payment_reference)' "${payment_response}")
replacement_payment_response=$(curl --fail --silent --request POST --header 'Content-Type: application/json' --data "${payment_body}" "${url}/service-request/2026-THIN-CLIENT-SERVICE-REQUEST/card-payments")
replacement_payment_reference=$(node -e 'console.log(JSON.parse(process.argv[1]).payment_reference)' "${replacement_payment_response}")
if [ "${payment_reference}" = "${replacement_payment_reference}" ]; then
  echo 'Expected a new payment to replace an unfinished payment with a unique reference' >&2
  exit 1
fi
payment_reference="${replacement_payment_reference}"
initiated_status=$(curl --fail --silent "${url}/card-payments/${payment_reference}/statuses")
if ! grep --quiet '"status":"Initiated"' <<<"${initiated_status}"; then
  echo "Expected a newly created payment to be initiated, got ${initiated_status}" >&2
  exit 1
fi
assert_status 200 GET '/thin-pay/card?return_url=https%3A%2F%2Fexample.test%2Fclaim-issued-payment-confirmation%2F1234&amount=115.00'
assert_status 200 GET '/thin-pay/confirm?return_url=https%3A%2F%2Fexample.test%2Fclaim-issued-payment-confirmation%2F1234&amount=115.00'
successful_status=$(curl --fail --silent "${url}/card-payments/${payment_reference}/statuses")
if ! grep --quiet '"status":"Success"' <<<"${successful_status}"; then
  echo "Expected a confirmed payment to be successful, got ${successful_status}" >&2
  exit 1
fi

second_payment_response=$(curl --fail --silent --request POST --header 'Content-Type: application/json' --data "${payment_body}" "${url}/service-request/2026-THIN-CLIENT-SERVICE-REQUEST/card-payments")
second_payment_reference=$(node -e 'console.log(JSON.parse(process.argv[1]).payment_reference)' "${second_payment_response}")
if [ "${payment_reference}" = "${second_payment_reference}" ]; then
  echo 'Expected each card payment to return a unique payment reference' >&2
  exit 1
fi
second_initiated_status=$(curl --fail --silent "${url}/card-payments/${second_payment_reference}/statuses")
if ! grep --quiet '"status":"Initiated"' <<<"${second_initiated_status}"; then
  echo "Expected the payment scenario to reset for the next payment, got ${second_initiated_status}" >&2
  exit 1
fi
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

upload_document() {
  curl --fail --silent \
  --form 'classification=RESTRICTED' \
  --form 'caseTypeId=CIVIL' \
  --form 'jurisdictionId=CIVIL' \
  --form 'files=@charts/civil-citizen-ui/wiremock/__files/create-claim-claim-fee.json;type=application/pdf' \
  "${url}/cases/documents"
}

upload_response=$(upload_document)
second_upload_response=$(upload_document)
document_id=$(node -e 'const response=JSON.parse(process.argv[1]); console.log(response.documents[0]._links.self.href.split("/").pop())' "${upload_response}")
second_document_id=$(node -e 'const response=JSON.parse(process.argv[1]); console.log(response.documents[0]._links.self.href.split("/").pop())' "${second_upload_response}")
if [ "${document_id}" = "${second_document_id}" ]; then
  echo 'Expected each multipart document upload to return a unique document ID' >&2
  exit 1
fi
if ! grep --quiet "dm-store-aat.service.core-compute-aat.internal/documents/${document_id}" <<<"${upload_response}"; then
  echo 'Expected multipart document upload to return a CCD-compatible DM Store link' >&2
  exit 1
fi
metadata_response=$(curl --fail --silent "${url}/cases/documents/${document_id}")
if ! grep --quiet "\"hashToken\":\"thin-client-${document_id}\"" <<<"${metadata_response}"; then
  echo 'Expected document metadata to preserve the upload hash token' >&2
  exit 1
fi

# Significant match rules must leave incorrect requests unmatched.
assert_status 404 POST '/dashboard/scenarios/Scenario.WRONG/test-user' '{"params":{}}'
assert_status 404 POST '/fees/claim/total-amount' '{"amount":1385}'
assert_status 404 GET '/fees-register/fees/lookup?service=other&jurisdiction1=civil&jurisdiction2=civil&channel=default&event=miscellaneous&keyword=WrongKeyword'
assert_status 404 POST '/cases/draft/citizen/test-user/event' '{"event":"WRONG_EVENT"}'
assert_status 404 GET '/search/places/v1/postcode?postcode=SW1A%201AA'
assert_status 404 POST '/service-request/2026-THIN-CLIENT-SERVICE-REQUEST/card-payments' '{"amount":115,"currency":"USD","return-url":"https://example.test/payment"}'
assert_status 404 GET '/card-payments/RC-UNKNOWN/statuses'
assert_status 404 POST '/cases/documents' '{}'
assert_status 404 PATCH '/cases/documents/attach-to-case' '{}'

echo 'WireMock complete-set startup and positive/negative contract checks passed.'
