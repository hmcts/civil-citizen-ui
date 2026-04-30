#!/usr/bin/env bash

set -eu

environment="${1:-${ENVIRONMENT:-}}"
root_dir=$(realpath "$(dirname "${0}")/..")
work_dir="${root_dir}/.high-level-data-setup/civil-ccd-definition"
branch_name="${CCD_DEFINITION_BRANCH:-master}"
shared_branch_name="${CIVIL_SERVICE_SHARED_BRANCH:-master}"
default_aat_definition_store_url="https://civil-cui-definition-store-staging.aat.platform.hmcts.net"
default_aat_case_service_url="https://civil-cui-civil-service-staging.aat.platform.hmcts.net"
default_aat_aac_url="https://civil-cui-manage-case-assignment-staging.aat.platform.hmcts.net"

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
  rm -rf "${work_dir}"
}

trap cleanup EXIT

if [ -z "${environment}" ]; then
  echo "Usage: ./bin/run-ccd-high-level-data-setup.sh <preview|aat>"
  exit 1
fi

if [ "${environment}" = "aat" ] && [ "${SKIP_COMMON_AAT_CCD_SETUP:-false}" = "true" ]; then
  echo "Skipping shared AAT CCD high level data setup"
  exit 0
fi

case "${environment}" in
  preview)
    # Preview runs should prefer the preview definition store URL over any inherited default.
    definition_store_url="${CCD_DEFINITION_STORE_API_BASE_URL:-${DEFINITION_STORE_URL_BASE:-}}"
    case_service_url="${CCD_DEF_CASE_SERVICE_BASE_URL:-${CIVIL_SERVICE_URL:-}}"
    aac_url="${CCD_DEF_AAC_URL:-${AAC_API_URL:-}}"

    if [ -z "${definition_store_url}" ] && [ -n "${CHANGE_ID:-}" ]; then
      definition_store_url="https://ccd-definition-store-civil-citizen-ui-pr-${CHANGE_ID}.preview.platform.hmcts.net"
    fi
    if [ -z "${case_service_url}" ] && [ -n "${CHANGE_ID:-}" ]; then
      case_service_url="https://civil-citizen-ui-pr-${CHANGE_ID}-civil-service.preview.platform.hmcts.net"
    fi
    if [ -z "${aac_url}" ] && [ -n "${CHANGE_ID:-}" ]; then
      aac_url="https://manage-case-assignment-civil-citizen-ui-pr-${CHANGE_ID}.preview.platform.hmcts.net"
    fi

    if [ -z "${definition_store_url}" ] || [ -z "${case_service_url}" ] || [ -z "${aac_url}" ]; then
      echo "Preview CCD setup requires CHANGE_ID or preview URLs to be set"
      exit 1
    fi
    export DEFINITION_STORE_URL_BASE="${definition_store_url}"
    export CCD_DEFINITION_STORE_API_BASE_URL="${definition_store_url}"
    export CCD_DEF_CASE_SERVICE_BASE_URL="${case_service_url}"
    export CCD_DEF_AAC_URL="${aac_url}"
    ;;
  aat)
    definition_store_url="${DEFINITION_STORE_URL_BASE:-${CCD_DEFINITION_STORE_API_BASE_URL:-${default_aat_definition_store_url}}}"
    case_service_url="${CCD_DEF_CASE_SERVICE_BASE_URL:-${CIVIL_SERVICE_URL:-${default_aat_case_service_url}}}"
    aac_url="${CCD_DEF_AAC_URL:-${AAC_API_URL:-${default_aat_aac_url}}}"

    if is_preview_value "${definition_store_url}" || is_preview_value "${case_service_url}" || is_preview_value "${aac_url}"; then
      echo "AAT CCD HLD refuses preview targets: definition_store=${definition_store_url} case_service=${case_service_url} aac=${aac_url}"
      exit 1
    fi

    export DEFINITION_STORE_URL_BASE="${definition_store_url}"
    export CCD_DEFINITION_STORE_API_BASE_URL="${definition_store_url}"
    export CCD_DEF_CASE_SERVICE_BASE_URL="${case_service_url}"
    export CCD_DEF_AAC_URL="${aac_url}"
    ;;
  *)
    echo "Unsupported environment: ${environment}"
    exit 1
    ;;
esac

export ENVIRONMENT="${environment}"
export CCD_DEF_GEN_APP_SERVICE_BASE_URL="${CCD_DEF_GEN_APP_SERVICE_BASE_URL:-${CCD_DEF_CASE_SERVICE_BASE_URL}}"
export IDAM_API_URL_BASE="${IDAM_API_URL_BASE:-${IDAM_API_BASE_URL:-${IDAM_API_URL:-https://idam-api.aat.platform.hmcts.net}}}"
export S2S_URL_BASE="${S2S_URL_BASE:-${SERVICE_AUTH_PROVIDER_API_BASE_URL:-http://rpe-service-auth-provider-aat.service.core-compute-aat.internal}}"
export CCD_API_GATEWAY_OAUTH2_CLIENT_ID="${CCD_API_GATEWAY_OAUTH2_CLIENT_ID:-ccd_gateway}"
export CCD_API_GATEWAY_OAUTH2_REDIRECT_URL="${CCD_API_GATEWAY_OAUTH2_REDIRECT_URL:-${CCD_IDAM_REDIRECT_URL:-https://ccd-case-management-web-aat.service.core-compute-aat.internal/oauth2redirect}}"
#
# Shared HLD loaders do not consistently read the same client-secret variable name.
# Preserve the Jenkins-provided secret and expose it under the names used by BEFTA.
export CCD_API_GATEWAY_OAUTH2_CLIENT_SECRET="${CCD_API_GATEWAY_OAUTH2_CLIENT_SECRET:-${CCD_API_GATEWAY_IDAM_CLIENT_SECRET:-${OAUTH2_CLIENT_SECRET:-}}}"
export OAUTH2_CLIENT_SECRET="${OAUTH2_CLIENT_SECRET:-${CCD_API_GATEWAY_OAUTH2_CLIENT_SECRET}}"
export CCD_API_GATEWAY_S2S_ID="${CCD_API_GATEWAY_S2S_ID:-ccd_gw}"
export CCD_API_GATEWAY_S2S_KEY="${CCD_API_GATEWAY_S2S_KEY:-${CCD_API_GATEWAY_S2S_SECRET:-}}"
export DEFINITION_IMPORTER_USERNAME="${DEFINITION_IMPORTER_USERNAME:-${CCD_CONFIGURER_IMPORTER_USERNAME:-}}"
export DEFINITION_IMPORTER_PASSWORD="${DEFINITION_IMPORTER_PASSWORD:-${CCD_CONFIGURER_IMPORTER_PASSWORD:-}}"

echo "CCD HLD targets: definition_store=${DEFINITION_STORE_URL_BASE} case_service=${CCD_DEF_CASE_SERVICE_BASE_URL} aac=${CCD_DEF_AAC_URL}"

if [ -z "${CCD_API_GATEWAY_S2S_KEY:-}" ]; then
  echo "CCD_API_GATEWAY_S2S_KEY or CCD_API_GATEWAY_S2S_SECRET must be set"
  exit 1
fi

if [ -z "${CCD_API_GATEWAY_OAUTH2_CLIENT_SECRET:-}" ]; then
  echo "CCD_API_GATEWAY_OAUTH2_CLIENT_SECRET, CCD_API_GATEWAY_IDAM_CLIENT_SECRET or OAUTH2_CLIENT_SECRET must be set"
  exit 1
fi

if [ -z "${DEFINITION_IMPORTER_USERNAME:-}" ] || [ -z "${DEFINITION_IMPORTER_PASSWORD:-}" ]; then
  echo "Definition importer credentials must be set"
  exit 1
fi

mkdir -p "$(dirname "${work_dir}")"
git clone --depth 1 --branch "${branch_name}" https://github.com/hmcts/civil-ccd-definition.git "${work_dir}"

(
  cd "${work_dir}"
  ./bin/pull-latest-civil-shared.sh "${shared_branch_name}"
  ./bin/build-release-ccd-definition.sh "${environment}"
  ./gradlew --rerun-tasks highLevelDataSetup --args="${environment}"
)
