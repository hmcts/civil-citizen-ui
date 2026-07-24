#!/usr/bin/env bash

set -euo pipefail

branchName=${1:-master}
checkout_dir=$(mktemp -d "${TMPDIR:-/tmp}/civil-wiremock-mappings.XXXXXX")

cleanup() {
  rm -rf "${checkout_dir}"
}

trap cleanup EXIT INT TERM

echo "Pulling wiremock mappings from civil-wiremock-mappings (branch: ${branchName})"

# Clone only the requested revision into an isolated temporary directory. This
# prevents a failed clone from accidentally running git commands in the CUI
# checkout.
git clone --depth 1 --branch "${branchName}" https://github.com/hmcts/civil-wiremock-mappings.git "${checkout_dir}"

# Ensure wiremock directory exists
mkdir -p ./wiremock/mappings
mkdir -p ./wiremock/__files

# Copy only cui-specific mappings and __files to local wiremock directory
# (civil-citizen-ui only needs the cui/ subdirectory contents)
cp -r "${checkout_dir}"/mappings/cui/* ./wiremock/mappings/
cp -r "${checkout_dir}"/__files/cui/* ./wiremock/__files/

# Overlay CUI-owned mappings used by both the local runner and the preview
# WireMock chart. Keeping one copy prevents the two execution paths drifting.
if [ -d ./charts/civil-citizen-ui/wiremock/mappings ]; then
  cp -r ./charts/civil-citizen-ui/wiremock/mappings/* ./wiremock/mappings/
fi

echo "Wiremock mappings pulled successfully (cui only)"
