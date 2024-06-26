#!/usr/bin/env bash
params="$1"
branchName="$2"

git clone https://github.com/hmcts/civil-ccd-definition.git
cd civil-ccd-definition

echo "Switch to ${branchName} branch on civil-ccd-definition"
git checkout ${branchName}

cd ..

#Copy ccd definition files to civil-ccd-def which contains ccd def files
cp -r ./civil-ccd-definition/ccd-definition .
rm -rf ./civil-ccd-definition

definition_input_dir=$(realpath 'ccd-definition')
definition_output_file="$(realpath ".")/build/ccd-development-config/ccd-civil-dev.xlsx"
params="$@"

./bin/utils/import-ccd-definition.sh "${definition_input_dir}" "${definition_output_file}" "${params}"
