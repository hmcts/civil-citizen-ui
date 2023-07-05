#!/bin/bash
set -ex

# Setup required for Saucelabs environment variables. TEST_URL should be set by CNP
export E2E_FRONTEND_URL=${TEST_URL}
export FEATURE_IDAM=true
export IDAM_API_URL=${IDAM_API_URL:-"https://idam-api.aat.platform.hmcts.net"}
export IGNORE_SESSION_VALIDATION=true

EXIT_STATUS=0
#BROWSER_GROUP=microsoftIE11 yarn test-crossbrowser-e2e || EXIT_STATUS=$?
#BROWSER_GROUP=microsoftEdge yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=chrome yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=firefox yarn test-crossbrowser-e2e || EXIT_STATUS=$?
#BROWSER_GROUP=safari yarn test-crossbrowser-e2e || EXIT_STATUS=$?
echo EXIT_STATUS: $EXIT_STATUS
exit $EXIT_STATUS
