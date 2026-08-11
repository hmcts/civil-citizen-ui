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
requests, near misses and the request journal. An unmatched request is recorded
as a `wiremock-verification` failure even when the browser scenario itself
passed. Its summary includes the request method and URL plus links to the
WireMock diagnostics.

## Masking

The generated summary and every archived WireMock diagnostic redact bearer
tokens, JWTs, authorization headers, cookies, common secret fields, email
addresses and long payment-like numbers before writing JSON. Raw WireMock
request journals are held only in a temporary directory for verification and
are not archived. The console prints method and URL from the sanitised artifact.
Do not attach raw Jenkins console logs, raw pod logs or raw Allure files to Jira
unless they have been separately checked for sensitive data.

## Retention

Functional diagnostics are archived with the Jenkins build. Jenkins build and
artifact retention defines the available reporting window. Use the build URL
from the summary when recording failure evidence.
