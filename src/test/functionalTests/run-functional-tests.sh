#!/bin/bash
set -e

compare_ft_groups() {
  local ft_groups_csv pr_ft_groups_csv

  # Extract ftGroups array as a comma-separated string (sorted)
  ft_groups_csv=$(jq -r '
    if (.ftGroups == null or (.ftGroups | length == 0)) 
    then "" 
    else (.ftGroups | sort | join(",")) 
    end
  ' "$TEST_FILES_REPORT")

  # Normalize PR_FT_GROUPS (sort, trim spaces, split by comma, then rejoin sorted)
  pr_ft_groups_csv=""
  if [[ -n "$PR_FT_GROUPS" ]]; then
    pr_ft_groups_csv=$(echo "$PR_FT_GROUPS" | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort | paste -sd "," -)
  fi

  # Comparison logic
  if [[ "$ft_groups_csv" = "$pr_ft_groups_csv" ]]; then
    return 0  # true — they match
  else
    return 1  # false — they differ
  fi
}

assert_no_functional_report_failures() {
  local report_dir report_prefix report_files

  report_dir="${REPORT_DIR:-test-results/functional}"
  report_prefix="${MOCHAWESOME_REPORTFILENAME:-civil-citizen-pr}"

  if [[ ! -d "$report_dir" ]]; then
    return 0
  fi

  report_files=$(find "$report_dir" -maxdepth 1 -type f -name "${report_prefix}-*.json" 2>/dev/null || true)

  if [[ -z "$report_files" ]]; then
    return 0
  fi

  node -e '
    const fs = require("fs");
    const reports = process.argv.slice(1);
    const failedReports = reports
      .map((report) => {
        const data = JSON.parse(fs.readFileSync(report, "utf8"));
        return {
          report,
          failures: Number(data?.stats?.failures || 0),
          passes: Number(data?.stats?.passes || 0),
          pending: Number(data?.stats?.pending || 0),
        };
      })
      .filter(({ failures }) => failures > 0);

    if (failedReports.length > 0) {
      console.error("Functional test report failures detected:");
      failedReports.forEach(({ report, failures, passes, pending }) => {
        console.error(`- ${report}: ${failures} failed, ${passes} passed, ${pending} skipped`);
      });
      process.exit(1);
    }
  ' $report_files
}

publish_functional_failure_diagnostic() {
  local summary_file='test-results/functional/functional-failure-summary.json'

  node src/test/functionalTests/diagnostics/generateFunctionalFailureSummary.js || true
  if [[ -n "${CHANGE_ID:-}" ]] && command -v kubectl >/dev/null 2>&1 && [[ -f "$summary_file" ]]; then
    kubectl create configmap "civil-citizen-ui-pr-${CHANGE_ID}-functional-diagnostic" \
      --namespace civil \
      --from-file=functional-failure-summary.json="$summary_file" \
      --dry-run=client -o yaml | kubectl apply -f - || true
  fi
}

run_functional_command() {
  local exit_code

  set +e
  "$@"
  exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 ]]; then
    publish_functional_failure_diagnostic
  fi
  assert_no_functional_report_failures

  if [[ "$exit_code" -ne 0 ]]; then
    exit "$exit_code"
  fi
}

run_functional_test_groups() {
  local command

  command="yarn test:civil-citizen-pr --grep "
  pr_ft_groups=$(echo "$PR_FT_GROUPS" | awk '{print tolower($0)}')
  
  regex_pattern=""

  IFS=',' read -ra ft_groups_array <<< "$pr_ft_groups"

  for ft_group in "${ft_groups_array[@]}"; do
      if [[ -n "$regex_pattern" ]]; then
          regex_pattern+="|"
      fi
      regex_pattern+="@$ft_group"
  done

  command+="'$regex_pattern'"
  echo "Executing: $command"

  set +e
  eval "$command"
  exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 ]]; then
    publish_functional_failure_diagnostic
  fi
  assert_no_functional_report_failures

  if [[ "$exit_code" -ne 0 ]]; then
    exit "$exit_code"
  fi
}

run_functional_tests() {
  local started elapsed

  started=$SECONDS
  echo "Running all functional tests on ${ENVIRONMENT} env"
  if [[ "$ENVIRONMENT" = "aat" ]]; then
    run_functional_command yarn test:civil-citizen-master
  elif [[ -z "$PR_FT_GROUPS" ]]; then
    run_functional_command yarn test:civil-citizen-pr
  else
    run_functional_test_groups
  fi

  elapsed=$((SECONDS - started))
  mkdir -p test-results/functional
  printf 'mode,duration_seconds\nstandard,%s\n' "$elapsed" \
    > test-results/functional/standard-timings.csv
  echo "Standard functional execution completed in ${elapsed}s"
}

run_failed_not_executed_functional_tests() {
  echo "Running failed and not executed functional test files on ${ENVIRONMENT} env"

  #Move testFilesReport.json to prevTestFilesReport.json
  mv "$TEST_FILES_REPORT" "$PREV_TEST_FILES_REPORT"

  # Collect array elements into a comma-separated string
  PREV_FAILED_TEST_FILES=$(jq -r '.failedTestFiles[]' "$PREV_TEST_FILES_REPORT" | paste -sd "," -)

  # Collect array elements into a comma-separated string
  PREV_NOT_EXECUTED_TEST_FILES=$(jq -r '.notExecutedTestFiles[]' "$PREV_TEST_FILES_REPORT" | paste -sd "," -)

  # Export as environment variable
  export PREV_FAILED_TEST_FILES="$PREV_FAILED_TEST_FILES"
  export PREV_NOT_EXECUTED_TEST_FILES="$PREV_NOT_EXECUTED_TEST_FILES"
  
  run_functional_tests
}

run_optimised_functional_tests() {
  local base_pattern mocked_pattern thin_pattern residual_pattern
  local started bucket_started bucket_elapsed total_elapsed

  echo "Running the standard functional-test selection through optimised execution buckets"
  yarn playwright install chromium
  export FUNCTIONAL=true
  unset PREV_FAILED_TEST_FILES PREV_NOT_EXECUTED_TEST_FILES

  if [[ -n "${PR_FT_GROUPS:-}" ]]; then
    base_pattern=$(echo "$PR_FT_GROUPS" | tr '[:upper:]' '[:lower:]' | sed 's/[[:space:]]//g; s/,/|@/g; s/^/@/')
  else
    base_pattern='@civil-citizen-pr'
  fi

  mocked_pattern="(?=.*(?:${base_pattern}))(?=.*@mocked-functional)"
  thin_pattern="(?=.*(?:${base_pattern}))(?=.*@thin-full-stack)(?!.*@mocked-functional)"
  residual_pattern="(?=.*(?:${base_pattern}))(?!.*@mocked-functional)(?!.*@thin-full-stack)"
  mkdir -p test-results/functional
  printf 'bucket,duration_seconds\n' > test-results/functional/optimised-timings.csv
  started=$SECONDS

  ./bin/configure-functional-test-router.sh real
  for bucket in residual thin-client; do
    bucket_started=$SECONDS
    if [[ "$bucket" = 'residual' ]]; then
      pattern="$residual_pattern"
    else
      pattern="$thin_pattern"
    fi
    echo "Running ${bucket} bucket for baseline selection: ${base_pattern}"
    MOCHAWESOME_REPORTFILENAME="optimised-${bucket}" \
      run_functional_command yarn codeceptjs run-workers --suites 13 --grep "$pattern" \
      --reporter mocha-multi --plugins allure --verbose
    bucket_elapsed=$((SECONDS - bucket_started))
    printf '%s,%s\n' "$bucket" "$bucket_elapsed" >> test-results/functional/optimised-timings.csv
  done

  ./bin/configure-functional-test-router.sh mocked
  bucket_started=$SECONDS
  echo "Running mocked bucket for baseline selection: ${base_pattern}"
  if [[ "$base_pattern" = *'@ui-create-claim'* ]]; then
    export WIREMOCK_EXPECT_CREATE_CLAIM=true
  fi
  MOCHAWESOME_REPORTFILENAME='optimised-mocked' \
    run_functional_command yarn codeceptjs run-workers --suites 13 --grep "$mocked_pattern" \
    --reporter mocha-multi --plugins allure --verbose
  ./bin/assert-preview-wiremock.sh
  bucket_elapsed=$((SECONDS - bucket_started))
  printf 'mocked,%s\n' "$bucket_elapsed" >> test-results/functional/optimised-timings.csv

  total_elapsed=$((SECONDS - started))
  printf 'total,%s\n' "$total_elapsed" >> test-results/functional/optimised-timings.csv
  echo "Optimised execution completed in ${total_elapsed}s; bucket timings are archived with the functional results"
}

assert_thin_full_stack_results() {
  local report_dir="${THIN_JUNIT_REPORT_DIR:-test-results/thin-full-stack}"
  local aggregate_report="${THIN_JUNIT_REPORT:-test-results/thin-full-stack/result.xml}"
  local allure_dir="${THIN_ALLURE_RESULTS_DIR:-test-results/thin-full-stack/allure-results}"

  node - "$report_dir" "$aggregate_report" "$allure_dir" <<'NODE'
    const fs = require('fs');
    const path = require('path');
    const {XMLBuilder, XMLParser} = require('fast-xml-parser');

    const [reportDir, aggregateReport, allureDir] = process.argv.slice(2);
    const expectedTests = 8;

    if (!fs.existsSync(reportDir)) {
      throw new Error(`Thin full-stack JUnit report directory is missing: ${reportDir}`);
    }

    const reportFiles = fs.readdirSync(reportDir)
      .filter((file) => file.startsWith('result-') && file.endsWith('.xml'))
      .map((file) => path.join(reportDir, file));
    if (reportFiles.length === 0) {
      throw new Error(`Thin full-stack JUnit reports are missing: ${reportDir}`);
    }

    const parser = new XMLParser({ignoreAttributes: false, attributeNamePrefix: ''});
    const summaries = reportFiles.map((file) => parser.parse(fs.readFileSync(file, 'utf8')).testsuites);
    const suites = summaries.flatMap((summary) => {
      const value = summary?.testsuite;
      return value ? (Array.isArray(value) ? value : [value]) : [];
    }).map((suite) => {
      const value = suite?.testcase;
      const testcases = value ? (Array.isArray(value) ? value : [value]) : [];
      return {
        ...suite,
        tests: testcases.length,
        failures: testcases.filter((testcase) => testcase.failure !== undefined).length,
        errors: testcases.filter((testcase) => testcase.error !== undefined).length,
        skipped: testcases.filter((testcase) => testcase.skipped !== undefined).length,
        testcase: testcases,
      };
    }).filter((suite) => suite.tests > 0);
    const total = (field) => suites.reduce((sum, suite) => sum + Number(suite[field] || 0), 0);
    const tests = total('tests');
    const failures = total('failures');
    const errors = total('errors');
    const skipped = total('skipped');

    if (tests !== expectedTests || failures !== 0 || errors !== 0 || skipped !== 0) {
      throw new Error(
        `Thin full-stack JUnit attestation failed: expected ${expectedTests} tests, ` +
        `found ${tests} with ${failures} failures, ${errors} errors and ${skipped} skipped`,
      );
    }

    const aggregate = {
      testsuites: {
        name: 'Thin full-stack tests',
        tests,
        failures,
        errors,
        skipped,
        testsuite: suites,
      },
    };
    fs.writeFileSync(
      aggregateReport,
      new XMLBuilder({ignoreAttributes: false, attributeNamePrefix: '', format: true}).build(aggregate),
    );

    if (!fs.existsSync(allureDir)) {
      throw new Error(`Thin full-stack Allure results directory is missing: ${allureDir}`);
    }

    const resultFiles = fs.readdirSync(allureDir).filter((file) => file.endsWith('-result.json'));
    if (resultFiles.length !== expectedTests) {
      throw new Error(
        `Thin full-stack Allure attestation failed: expected ${expectedTests} result files, ` +
        `found ${resultFiles.length}`,
      );
    }

    const nonPassingResults = resultFiles
      .map((file) => ({file, result: JSON.parse(fs.readFileSync(path.join(allureDir, file), 'utf8'))}))
      .filter(({result}) => result.status !== 'passed');
    if (nonPassingResults.length > 0) {
      throw new Error(
        `Thin full-stack Allure attestation found non-passing results: ${nonPassingResults
          .map(({file, result}) => `${file} (${result.status || 'missing status'})`)
          .join(', ')}`,
      );
    }

    console.log(`Thin full-stack attestation passed: ${expectedTests} tests executed and passed`);
NODE
}

#MAIN SCRIPT
TEST_FILES_REPORT="test-results/functional/testFilesReport.json"
PREV_TEST_FILES_REPORT="test-results/functional/prevTestFilesReport.json"
export REPORT_FILE="${REPORT_FILE:-test-results/functional/result-[hash].xml}"

if [[ "${SKIP_FUNCTIONAL_TESTS:-false}" = "true" ]]; then
  echo "The label 'pr-values:skip-functional-tests' exists on the PR."
  echo "Skipping functional tests."
  exit 0
fi

if [[ "${OPTIMISED_FUNCTIONAL_TESTS:-false}" = "true" ]]; then
  run_optimised_functional_tests
  exit 0
fi

# Check if SKIP_FUNCTIONAL_TESTS is set to true
if [[ "$SKIP_FUNCTIONAL_TESTS" = "true" ]]; then
  echo "The label 'pr-values:skip-functional-tests' exists on the PR."
  echo "Skipping functional tests."
  exit 0

#Check if RUN_ALL_FUNCTIONAL_TESTS is set to true
elif [[ "$RUN_ALL_FUNCTIONAL_TESTS" = "true" ]]; then
  echo "The label 'runAllFunctionalTests' exists on the PR."
  echo "Running all functional tests."
  run_functional_tests

#Check if testFilesReport.json exists and is non-empty
elif [[ ! -f "$TEST_FILES_REPORT" ]] || [[ ! -s "$TEST_FILES_REPORT" ]]; then
  echo "testFilesReport.json not found or is empty."
  run_functional_tests

#Check if latest current git commit is the not the same as git commit of test files report 
elif [[ "$(jq -r 'if .gitCommitId == null then "__NULL__" else .gitCommitId end' "$TEST_FILES_REPORT")" != "$GIT_COMMIT" ]]; then 
  echo "The gitCommitId does not match the current GIT_COMMIT.";
  run_functional_tests

#Check if ft_groups of test files report is the same as current ft_groups.
elif ! compare_ft_groups; then
  echo "ftGroups do NOT match PR_FT_GROUPS"
  run_functional_tests

else
  run_failed_not_executed_functional_tests
fi
