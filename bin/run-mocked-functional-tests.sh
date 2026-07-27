#!/usr/bin/env bash

set -euo pipefail

readonly WIREMOCK_PORT="${WIREMOCK_PORT:-1111}"
readonly CUI_PORT="${CUI_PORT:-3001}"
export WIREMOCK_URL="http://127.0.0.1:${WIREMOCK_PORT}"
readonly WIREMOCK_URL
readonly CUI_URL="http://127.0.0.1:${CUI_PORT}"
readonly RUN_LOG_DIR="${TMPDIR:-/tmp}/civil-citizen-ui-mocked-functional"
readonly WIREMOCK_ROOT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/civil-citizen-ui-wiremock.XXXXXX")"

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
  rm -rf "${WIREMOCK_ROOT_DIR}"
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
  local process_pid="$3"
  local log_file="$4"
  local attempts=180

  until curl --fail --silent "${url}" >/dev/null 2>&1; do
    if ! kill -0 "${process_pid}" 2>/dev/null; then
      echo "${name} exited before becoming ready at ${url}" >&2
      echo "--- ${name} log ---" >&2
      tail -200 "${log_file}" >&2 || true
      return 1
    fi

    attempts=$((attempts - 1))
    if [ "${attempts}" -eq 0 ]; then
      echo "${name} did not become ready at ${url}" >&2
      echo "--- ${name} log ---" >&2
      tail -200 "${log_file}" >&2 || true
      return 1
    fi
    sleep 1
  done
}

trap cleanup EXIT INT TERM
mkdir -p "${RUN_LOG_DIR}"
mkdir -p "${WIREMOCK_ROOT_DIR}/mappings"
cp -r ./charts/civil-citizen-ui/wiremock/mappings/* "${WIREMOCK_ROOT_DIR}/mappings/"

./node_modules/.bin/wiremock --root-dir "${WIREMOCK_ROOT_DIR}" --port "${WIREMOCK_PORT}" >"${RUN_LOG_DIR}/wiremock.log" 2>&1 &
wiremock_pid=$!
wait_for_url 'WireMock' "${WIREMOCK_URL}/__admin/mappings" "${wiremock_pid}" "${RUN_LOG_DIR}/wiremock.log"

NODE_ENV=e2eTest \
PORT="${CUI_PORT}" \
CIVIL_SERVICE_URL="${WIREMOCK_URL}" \
ORDNANCE_SURVEY_API_URL="${WIREMOCK_URL}" \
ORDNANCE_SURVEY_API_KEY='mock-key' \
PCQ_URL="${CUI_URL}" \
./node_modules/.bin/ts-node -r tsconfig-paths/register src/main/server.ts >"${RUN_LOG_DIR}/cui.log" 2>&1 &
cui_pid=$!
wait_for_url 'CUI' "${CUI_URL}/health" "${cui_pid}" "${RUN_LOG_DIR}/cui.log"

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
  yarn test:mocked-functional:browser || browser_status=$?
./bin/assert-preview-wiremock.sh || wiremock_status=$?
exit "${browser_status:-${wiremock_status:-0}}"
