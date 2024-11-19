#!/bin/bash
set -ex

# Always set IS_CROSSBROWSER to true for cross-browser testing
export IS_CROSSBROWSER=true

echo "Running Cross-browser tests on ${ENVIRONMENT} env"

if [[ "$BROWSER_GROUP" == "" ]]
then
    EXIT_STATUS=0
    BROWSER_GROUP=chrome yarn test:crossbrowser-functional || EXIT_STATUS=$?
    BROWSER_GROUP=firefox yarn test:crossbrowser-functional || EXIT_STATUS=$?
    BROWSER_GROUP=edge yarn test:crossbrowser-functional || EXIT_STATUS=$?
    BROWSER_GROUP=safari yarn test:crossbrowser-functional || EXIT_STATUS=$?
    echo EXIT_STATUS: $EXIT_STATUS
else
    # Compatible with Jenkins parallel crossbrowser pipeline
    yarn test:crossbrowser-functional
fi
