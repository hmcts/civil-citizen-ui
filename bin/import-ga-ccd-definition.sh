#!/usr/bin/env bash

params="$1"
branchName="$2"

#Checkout specific branch pf  civil camunda bpmn definition
git clone https://github.com/hmcts/civil-general-apps-ccd-definition.git
cd civil-general-apps-ccd-definition

echo "Switch to ${branchName} branch on civil-general-apps-ccd-definition"
git checkout ${branchName}
cd ..

#Copy ccd definition files  to civil-ccd-def which contians bpmn files
cp -r ./civil-general-apps-ccd-definition/ga-ccd-definition .
rm -rf ./civil-general-apps-ccd-definition

definition_input_dir=$(realpath 'ga-ccd-definition')
definition_output_file="$(realpath ".")/build/ccd-development-config/ccd-civil-apps-dev.xlsx"
params="$@"

./bin/utils/import-ccd-definition.sh "${definition_input_dir}" "${definition_output_file}" "${params}"
