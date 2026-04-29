#!/usr/bin/env bash

set -eu

environment="${1:-${ENVIRONMENT:-}}"

if [ -z "${environment}" ]; then
  echo "Usage: ./bin/run-high-level-data-setup.sh <preview|aat>"
  exit 1
fi

case "${environment}" in
  preview|aat)
    ;;
  *)
    echo "Unsupported environment: ${environment}"
    exit 1
    ;;
esac

if [ "${environment}" = "aat" ]; then
  # AAT HLD must not inherit PR context from earlier pipeline state.
  unset CHANGE_ID || true
fi

if [ "${environment}" = "preview" ] && [ -n "${CHANGE_ID:-}" ]; then
  # Force preview-specific service URLs even when Jenkins injects AAT defaults into the HLD stage.
  eval "$("${PWD}/bin/variables/load-preview-environment-variables.sh" "${CHANGE_ID}")"
fi

./bin/run-camunda-high-level-data-setup.sh "${environment}"
./bin/run-ccd-high-level-data-setup.sh "${environment}"
