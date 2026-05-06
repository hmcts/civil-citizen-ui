#!/usr/bin/env bash

set -eu

environment="${1:-${ENVIRONMENT:-}}"
root_dir=$(realpath "$(dirname "${0}")/..")
service_work_dir="${root_dir}/.high-level-data-setup/civil-service"
service_branch_name="${CIVIL_SERVICE_SETUP_BRANCH:-${CIVIL_SERVICE_SHARED_BRANCH:-master}}"
default_aat_camunda_url="https://civil-cui-camunda-staging.aat.platform.hmcts.net"

is_preview_value() {
  case "${1:-}" in
    *".preview.platform."*|*"civil-citizen-ui-pr-"*|*"ccd-definition-store-civil-citizen-ui-pr-"*|*"manage-case-assignment-civil-citizen-ui-pr-"*|*"camunda-civil-citizen-ui-pr-"*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

cleanup() {
  rm -rf "${service_work_dir}"
}

run_gradle_with_retry() {
  local attempt=1
  local max_attempts="${GRADLE_RETRY_ATTEMPTS:-3}"
  local delay_seconds="${GRADLE_RETRY_DELAY_SECONDS:-20}"

  while true; do
    if ./gradlew --rerun-tasks camundaHighLevelDataSetup; then
      return 0
    fi

    if [ "${attempt}" -ge "${max_attempts}" ]; then
      echo "camundaHighLevelDataSetup failed after ${attempt} attempt(s)"
      return 1
    fi

    echo "camundaHighLevelDataSetup failed on attempt ${attempt}; retrying in ${delay_seconds}s"
    sleep "${delay_seconds}"
    attempt=$((attempt + 1))
  done
}

trap cleanup EXIT

if [ -z "${environment}" ]; then
  echo "Usage: ./bin/run-camunda-high-level-data-setup.sh <preview|aat>"
  exit 1
fi

case "${environment}" in
  preview)
    camunda_base_url="${CAMUNDA_BASE_URL:-}"
    if [ -z "${camunda_base_url}" ] && [ -n "${CHANGE_ID:-}" ]; then
      camunda_base_url="https://camunda-civil-citizen-ui-pr-${CHANGE_ID}.preview.platform.hmcts.net"
    fi
    if [ -z "${camunda_base_url}" ]; then
      echo "Preview Camunda setup requires CHANGE_ID or CAMUNDA_BASE_URL to be set"
      exit 1
    fi
    export CAMUNDA_BASE_URL="${camunda_base_url}"
    ;;
  aat)
    camunda_base_url="${CAMUNDA_BASE_URL:-${default_aat_camunda_url}}"
    if is_preview_value "${camunda_base_url}"; then
      echo "AAT Camunda HLD refuses preview URL: ${camunda_base_url}"
      exit 1
    fi
    export CAMUNDA_BASE_URL="${camunda_base_url}"
    ;;
  *)
    echo "Unsupported environment: ${environment}"
    exit 1
    ;;
esac

export ENVIRONMENT="${environment}"
export S2S_URL_BASE="${S2S_URL_BASE:-${SERVICE_AUTH_PROVIDER_API_BASE_URL:-http://rpe-service-auth-provider-aat.service.core-compute-aat.internal}}"
export CAMUNDA_DEFINITION_BRANCH="${CAMUNDA_DEFINITION_BRANCH:-master}"
export DMN_DEFINITION_BRANCH="${DMN_DEFINITION_BRANCH:-master}"
export CCD_API_GATEWAY_S2S_ID="${CCD_API_GATEWAY_S2S_ID:-ccd_gw}"
export CCD_API_GATEWAY_S2S_KEY="${CCD_API_GATEWAY_S2S_KEY:-${CCD_API_GATEWAY_S2S_SECRET:-}}"

if [ -z "${CCD_API_GATEWAY_S2S_KEY:-}" ] && [ -z "${S2S_SECRET:-}" ]; then
  echo "Camunda imports require either CCD_API_GATEWAY_S2S_KEY/CCD_API_GATEWAY_S2S_SECRET or S2S_SECRET"
  exit 1
fi

mkdir -p "$(dirname "${service_work_dir}")"
git clone --depth 1 --branch "${service_branch_name}" https://github.com/hmcts/civil-service.git "${service_work_dir}"

(
  cd "${service_work_dir}"
  run_gradle_with_retry
)
