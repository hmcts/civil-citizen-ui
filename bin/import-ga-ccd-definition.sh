#!/usr/bin/env bash

set -eu

params="$1"
branchName="${2:-master}"

rm -rf ccd-definition civil-ccd-definition

git clone https://github.com/hmcts/civil-ccd-definition.git
cd civil-ccd-definition

echo "Switch to ${branchName} branch on civil-ccd-definition"
git checkout "${branchName}"
cd ..

cp -r ./civil-ccd-definition/ccd-definition .
rm -rf ./civil-ccd-definition

if [ ! -d "ccd-definition/generalapplication" ]; then
  echo "Unable to locate general application CCD definition directory at ccd-definition/generalapplication."
  exit 1
fi

definition_input_dir=$(realpath 'ccd-definition/generalapplication')
definition_output_file="$(realpath ".")/build/ccd-development-config/ccd-civil-apps-dev.xlsx"

./bin/utils/import-ccd-definition.sh "${definition_input_dir}" "${definition_output_file}" "${params}"
