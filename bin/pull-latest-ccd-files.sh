#!/usr/bin/env bash

branchName=$1

#Checkout specific branch pf  civil camunda bpmn definition
git clone https://github.com/hmcts/civil-ccd-definition.git
cd civil-ccd-definition

echo "Switch to ${branchName} branch on civil-ccd-definition"
git checkout ${branchName}
cd ..

#Copy ccd definition files to civil-ccd-def which contains ccd def files
cp -r ./civil-ccd-definition/ccd-definition .
echo *
rm -rf ./civil-ccd-definition
