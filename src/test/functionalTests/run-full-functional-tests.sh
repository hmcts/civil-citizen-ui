#!/bin/bash
set -ex

echo "Running Functional tests on ${ENVIRONMENT} env"

if [ "$FORCE_GREEN_BUILD" == "true" ]; then
  echo "Manually forced green build, no functional tests will be run."
  exit 0
fi

# The browser engines the full suite runs in, one after another: chromium, firefox and webkit (the engine Safari uses).
# Each browser keeps its own results (see FUNCTIONAL_TEST_BROWSER in codecept.conf.js). A failure in one browser does
# not stop the others from running, and the stage fails if any of them failed.
BROWSERS=${FUNCTIONAL_TEST_BROWSERS:-chromium firefox webkit}

# Check if RUN_FAILED_AND_PREV_NOT_EXECUTED_TEST_FILES is set to "true"
if [ "$RUN_PREV_FAILED_AND_NOT_EXECUTED_TEST_FILES" != "true" ]; then
  yarn playwright install
  EXIT_STATUS=0
  for FUNCTIONAL_TEST_BROWSER in $BROWSERS
  do
    echo "Running Functional tests in ${FUNCTIONAL_TEST_BROWSER}"
    FUNCTIONAL_TEST_BROWSER=$FUNCTIONAL_TEST_BROWSER yarn test:civil-citizen-nightly || EXIT_STATUS=$?
  done
  echo EXIT_STATUS: $EXIT_STATUS
  exit $EXIT_STATUS
fi

# Reruns the failed and not executed test files from the previous run. Each browser's files are rerun in that browser,
# from its own testFilesReport-<browser>.json. A testFilesReport.json from a run made before the suite ran in each
# browser is rerun in the default browser (chromium).
RERUN_COUNT=0
EXIT_STATUS=0
yarn playwright install
for FUNCTIONAL_TEST_BROWSER in "" $BROWSERS
do
  # Define path to testFilesReport.json and prevTestFilesReport.json
  SUFFIX=${FUNCTIONAL_TEST_BROWSER:+-$FUNCTIONAL_TEST_BROWSER}
  TEST_FILES_REPORT="test-results/functional/testFilesReport${SUFFIX}.json"
  PREV_TEST_FILES_REPORT="test-results/functional/prevTestFilesReport${SUFFIX}.json"

  # Check if the report exists and is non-empty
  if [ ! -f "$TEST_FILES_REPORT" ] || [ ! -s "$TEST_FILES_REPORT" ]; then
    echo "$TEST_FILES_REPORT not found or is empty."
    continue
  fi

  # Check if the failedTestFiles array inside the report is empty
  if [ "$(jq '.failedTestFiles | length' "$TEST_FILES_REPORT")" -eq 0 ]; then
    echo "failedTestFiles in $TEST_FILES_REPORT contains an empty array."
    continue
  fi

  echo "Running failed and not executed functional test files in ${FUNCTIONAL_TEST_BROWSER:-the default browser} on ${ENVIRONMENT} env"
  # Move the report to the prev report
  mv "$TEST_FILES_REPORT" "$PREV_TEST_FILES_REPORT"

  # Collect array elements into comma-separated strings
  PREV_FAILED_TEST_FILES=$(jq -r '.failedTestFiles[]' "$PREV_TEST_FILES_REPORT" | paste -sd "," -)
  PREV_NOT_EXECUTED_TEST_FILES=$(jq -r '.notExecutedTestFiles[]' "$PREV_TEST_FILES_REPORT" | paste -sd "," -)

  RERUN_COUNT=$((RERUN_COUNT + 1))
  PREV_FAILED_TEST_FILES="$PREV_FAILED_TEST_FILES" \
    PREV_NOT_EXECUTED_TEST_FILES="$PREV_NOT_EXECUTED_TEST_FILES" \
    FUNCTIONAL_TEST_BROWSER=$FUNCTIONAL_TEST_BROWSER \
    yarn test:civil-citizen-nightly || EXIT_STATUS=$?
done

if [ "$RERUN_COUNT" -eq 0 ]; then
  echo "No testFilesReport.json with failed test files was found."
  exit 1
fi

echo EXIT_STATUS: $EXIT_STATUS
exit $EXIT_STATUS
