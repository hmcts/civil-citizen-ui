#!/usr/bin/env bash

set -eu

ccdBranch=${1:-master}
camundaBranch=${2:-master}
dmnBranch=${3:-master}

previewTemplate=${DEV_ENV_TEMPLATE:-values.preview.template.yaml}

npx @hmcts/dev-env@latest --template "${previewTemplate}"

echo "Loading Environment Variables"
source ./bin/variables/load-dev-user-preview-environment-variables.sh
./bin/pull-latest-civil-shared.sh

echo "Running high level data setup"
export CAMUNDA_DEFINITION_BRANCH=${camundaBranch}
export DMN_DEFINITION_BRANCH=${dmnBranch}
export CCD_DEFINITION_BRANCH=${ccdBranch}
./bin/run-high-level-data-setup.sh preview

echo "Importing organisation roles"
./bin/add-org-roles-to-users.sh

echo "ENV variables set for devuser-preview environment."
echo "XUI_URL: $XUI_WEBAPP_URL"
echo "CUI_URL: $TEST_URL"
