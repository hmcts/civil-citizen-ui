#!/bin/bash
set -ex

# Setup required for Saucelabs environment variables. TEST_URL should be set by CNP
export E2E_FRONTEND_URL=${TEST_URL}
export IGNORE_SESSION_VALIDATION=true

EXIT_STATUS=0
BROWSER_GROUP=microsoftIE11 yarn test:crossbrowser:fullfunctional || EXIT_STATUS=$?
BROWSER_GROUP=microsoftEdge yarn test:crossbrowser:fullfunctional || EXIT_STATUS=$?
BROWSER_GROUP=chrome yarn test:crossbrowser:fullfunctional || EXIT_STATUS=$?
BROWSER_GROUP=firefox yarn test:crossbrowser:fullfunctional || EXIT_STATUS=$?
BROWSER_GROUP=safari yarn test:crossbrowser:fullfunctional || EXIT_STATUS=$?
echo EXIT_STATUS: $EXIT_STATUS
exit $EXIT_STATUS
