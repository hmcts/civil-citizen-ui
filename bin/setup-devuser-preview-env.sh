ccdBranch=${1:-master}
camundaBranch=${2:-master}
dmnBranch=${3:-master}
waStandaloneBranch=${4:-master}
generalAppCCDBranch=${5:-master}

echo "Loading Environment Variables"
source ./bin/variables/load-dev-user-preview-environment-variables.sh

echo "Importing Roles to the CCD pod"
./bin/add-roles.sh

echo "Importing Camunda definitions"
./bin/pull-latest-camunda-files.sh ${camundaBranch}
./bin/pull-latest-dmn-files.sh ${dmnBranch}
./bin/pull-latest-camunda-wa-files.sh ${waStandaloneBranch}
rm -rf $(pwd)/civil-bpmn

echo "Importing CCD definitions"
./bin/import-ccd-definition.sh "-e *-prod.json,*-shuttered.json" ${ccdBranch}
rm -rf $(pwd)/ccd-definition
./bin/import-ga-ccd-definition.sh "-e *-prod.json" ${generalAppCCDBranch}
rm -rf $(pwd)/ga-ccd-definition

rm -rf $(pwd)/build/ccd-development-config

echo "ENV variables set for devuser-preview environment."
echo "XUI_URL: $XUI_WEBAPP_URL"
echo "CUI_URL: $TEST_URL"
