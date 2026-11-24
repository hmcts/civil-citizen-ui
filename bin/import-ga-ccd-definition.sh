#!/usr/bin/env bash

set -eu

params="$1"
branchName="${2:-master}"
civilServiceRef="${3:-master}"

rm -rf ccd-definition civil-ccd-definition

# The civil-service ref decides whether the definitions come from civil-ccd-definition at branchName
# (today) or from civil-service. See bin/pull-civil-ccd-definitions.sh.
./bin/pull-civil-ccd-definitions.sh "${branchName}" "${civilServiceRef}"

if [ ! -d "ccd-definition/generalapplication" ]; then
  echo "Unable to locate general application CCD definition directory at ccd-definition/generalapplication."
  exit 1
fi

definition_input_dir=$(realpath 'ccd-definition/generalapplication')
definition_output_file="$(realpath ".")/build/ccd-development-config/ccd-civil-apps-dev.xlsx"

./bin/shared/import-ccd-definition.sh "${definition_input_dir}" "${definition_output_file}" "${params}"
