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

echo "Importing CCD definitions"
./bin/import-ccd-definition.sh "-e *-prod.json,*-shuttered.json" ${ccdBranch}
./bin/import-ga-ccd-definition.sh "-e *-prod.json" ${generalAppCCDBranch}

echo "ENV variables set for devuser-preview environment."
echo "CDAM_REDIRECT_URL: $CCD_IDAM_REDIRECT_URL"
