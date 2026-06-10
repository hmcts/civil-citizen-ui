#!/usr/bin/env bash

branchName=$1

#Checkout specific branch pf  civil camunda bpmn definition 
git clone https://github.com/hmcts/civil-camunda-bpmn-definition.git
cd civil-camunda-bpmn-definition

echo "Switch to ${branchName} branch on civil-camunda-bpmn-definition"
git checkout ${branchName}
cd ..
mkdir civil-bpmn

#Copy camunda folder to civil-ccd-def which contians bpmn files
cp -r ./civil-camunda-bpmn-definition/src/main/resources/camunda ./civil-bpmn/.
rm -rf ./civil-camunda-bpmn-definition

#upload bpmn files to environment      
./bin/import-bpmn-diagram.sh ./civil-bpmn/.
rm -rf ./civil-bpmn.