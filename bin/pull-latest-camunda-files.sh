#!/usr/bin/env bash

branchName=$1

#Checkout specific branch pf  civil camunda bpmn definition
git clone https://github.com/hmcts/civil-service.git
cd civil-camunda-bpmn-definition

echo "Switch to ${branchName} branch on civil-service"
git checkout ${branchName}
cd ..
mkdir civil-bpmn

#Copy camunda folder to civil-ccd-def which contians bpmn files
cp -r ./civil-service/src/main/resources/camunda ./civil-bpmn/.
rm -rf ./civil-service

#upload bpmn files to environment
./bin/import-bpmn-diagram.sh ./civil-bpmn/.
rm -rf ./civil-bpmn.
