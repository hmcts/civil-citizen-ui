# Functional Test Diagnostics

The Jenkins functional-test stages publish best-effort diagnostics in `post/always`.
The original functional-test exit code remains the primary result, while Allure,
HTML publication, artifact archiving, security diagnostics and pod-log collection
continue where possible.

## Primary Failure

Start with the Jenkins stage result, then open the archived artifact:

`test-results/functional/functional-failure-summary.json`

The summary is machine-readable and contains these fields:

- `schemaVersion`
- `jenkinsJobUrl`
- `buildNumber`
- `commitSha`
- `pr`
- `suite`
- `failures[].suite`
- `failures[].scenarioTest`
- `failures[].attemptNumber`
- `failures[].firstAttemptResult`
- `failures[].startTime`
- `failures[].endTime`
- `failures[].durationMs`
- `failures[].primaryStage`
- `failures[].primaryErrorSummary`
- `failures[].classification`
- `failures[].retryOutcome`
- `failures[].artifactLinks`
- `failures[].rawSignal`

Values that Jenkins cannot provide are written as `null`.

## Classification

Automatic classification is advisory. The summary keeps the sanitised raw signal
so developers or QA can correct the category later.

Allowed categories:

- `preview/dependency setup`
- `application defect`
- `test-quality/automation`
- `test-data`
- `CI/tooling`
- `unknown`

## Artifacts

Use the summary `artifactLinks` first. If no direct link is present, inspect the
archived `test-results/functional/**/*` artifacts for screenshots, videos,
traces, Mochawesome JSON/HTML and Allure results.

Reduced-stack runs that set `WIREMOCK_URL` also archive WireMock mismatch
diagnostics under `test-results/functional/wiremock/`, including unmatched
requests, near misses and the request journal.

## Masking

The generated summary redacts bearer tokens, JWTs, cookies, common secret fields,
email addresses and long payment-like numbers before writing the archived JSON.
Do not attach raw Jenkins console logs, raw pod logs or raw Allure files to Jira
unless they have been separately checked for sensitive data.

## Retention

Functional diagnostics are archived with the Jenkins build. Jenkins build and
artifact retention is the reporting window for DTSCCI-5976 reliability review;
use the build URL from the summary when recording evidence on Jira.

## Controlled Evidence Runs

The temporary DTSCCI-5976 browser diagnostics are selected with PR labels while
collecting Stage 3 evidence:

| Failure case | PR label |
| --- | --- |
| Browser assertion failure | `pr_ft_ui-diagnostics-assertion` |
| Element/selector timeout | `pr_ft_ui-diagnostics-selector-timeout` |
| CUI HTTP 500 signal | `pr_ft_ui-diagnostics-http-500` |
| Unmatched WireMock request | `pr-values:reducedStack` plus `pr_ft_ui-diagnostics-wiremock-unmatched` |
| Browser crash/infrastructure signal | `pr_ft_ui-diagnostics-browser-crash` |
| Allure failure after primary test failure | `pr-values:force-functional-allure-failure` plus one failing diagnostics label |

Prefer one failure case per Jenkins run. The runner has Mocha `bail` enabled, so
separate runs give cleaner primary-failure evidence and make the archived summary
unambiguous. The broader `pr_ft_ui-diagnostics` label can still be used for a
quick smoke of the diagnostics group, but it is less useful as closure evidence.
