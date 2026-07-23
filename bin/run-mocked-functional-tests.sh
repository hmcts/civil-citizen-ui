#!/usr/bin/env bash

set -euo pipefail

readonly WIREMOCK_URL="http://127.0.0.1:1111"
readonly CUI_URL="http://127.0.0.1:3001"
readonly RUN_LOG_DIR="${TMPDIR:-/tmp}/civil-citizen-ui-mocked-functional"

wiremock_pid=''
cui_pid=''

cleanup() {
  if [ -n "${cui_pid}" ]; then
    terminate_tree "${cui_pid}"
    wait "${cui_pid}" 2>/dev/null || true
  fi
  if [ -n "${wiremock_pid}" ]; then
    terminate_tree "${wiremock_pid}"
    wait "${wiremock_pid}" 2>/dev/null || true
  fi
}

terminate_tree() {
  local parent_pid="$1"
  local child_pid

  while read -r child_pid; do
    if [ -n "${child_pid}" ]; then
      terminate_tree "${child_pid}"
    fi
  done < <(pgrep -P "${parent_pid}" 2>/dev/null || true)

  kill "${parent_pid}" 2>/dev/null || true
}

wait_for_url() {
  local name="$1"
  local url="$2"
  local attempts=60

  until curl --fail --silent "${url}" >/dev/null 2>&1; do
    attempts=$((attempts - 1))
    if [ "${attempts}" -eq 0 ]; then
      echo "${name} did not become ready at ${url}" >&2
      return 1
    fi
    sleep 1
  done
}

assert_wiremock_request() {
  local description="$1"
  local request_pattern="$2"
  local response
  local count

  response="$(curl --fail --silent --show-error \
    --header 'Content-Type: application/json' \
    --data "${request_pattern}" \
    "${WIREMOCK_URL}/__admin/requests/count")"
  count="$(printf '%s' "${response}" | sed -E 's/[^0-9]//g')"

  if [ -z "${count}" ] || [ "${count}" -lt 1 ]; then
    echo "Expected WireMock to receive ${description}, response was: ${response}" >&2
    return 1
  fi
}

trap cleanup EXIT INT TERM
mkdir -p "${RUN_LOG_DIR}"

yarn wiremock:pull
./node_modules/.bin/wiremock --root-dir ./wiremock --port 1111 >"${RUN_LOG_DIR}/wiremock.log" 2>&1 &
wiremock_pid=$!
wait_for_url 'WireMock' "${WIREMOCK_URL}/__admin/mappings"

NODE_ENV=e2eTest \
PORT=3001 \
CIVIL_SERVICE_URL="${WIREMOCK_URL}" \
ORDNANCE_SURVEY_API_URL="${WIREMOCK_URL}" \
ORDNANCE_SURVEY_API_KEY='mock-key' \
PCQ_URL="${CUI_URL}" \
./node_modules/.bin/ts-node -r tsconfig-paths/register src/main/server.ts >"${RUN_LOG_DIR}/cui.log" 2>&1 &
cui_pid=$!
wait_for_url 'CUI' "${CUI_URL}/health"

curl --fail --silent --show-error --request DELETE "${WIREMOCK_URL}/__admin/requests" >/dev/null
TEST_URL="${CUI_URL}" \
IDAM_WEB_URL="${WIREMOCK_URL}" \
IDAM_API_URL="${WIREMOCK_URL}" \
IDAM_TEST_SUPPORT_API_URL="${WIREMOCK_URL}" \
SERVICE_AUTH_PROVIDER_API_BASE_URL="${WIREMOCK_URL}" \
CCD_DATA_STORE_URL="${WIREMOCK_URL}" \
DM_STORE_URL="${WIREMOCK_URL}" \
AAC_API_URL="${WIREMOCK_URL}" \
WA_TASK_MGMT_URL="${WIREMOCK_URL}" \
URL="${WIREMOCK_URL}" \
CIVIL_SERVICE_URL="${WIREMOCK_URL}" \
yarn test:mocked-functional:browser

assert_wiremock_request 'a claim submission request' \
  '{"method":"POST","urlPattern":"/cases/draft/citizen/.*/event"}'
assert_wiremock_request 'a submitted claim lookup' \
  '{"method":"GET","urlPath":"/cases/1111222233334444"}'
