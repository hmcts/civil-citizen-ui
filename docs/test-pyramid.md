# CUI test pyramid

This is the coverage-ownership contract for in-process tests. Follow it when adding or converting tests. Unit tests must not boot the Express app.

Related: [functional-tests.md](functional-tests.md) covers browser journeys and preview execution. This document owns unit vs in-process integration.

## Layers

| Layer | Location | Command | Allowed | Not allowed |
| --- | --- | --- | --- | --- |
| Unit | `src/test/unit` | `yarn test:coverage` | Call a handler, service, guard or model with mocked collaborators. Assert `res.render`, `res.redirect`, `next`, return values. | `request(app)`, `supertest`, `supertest-session`, importing `src/main/app` to hit HTTP, nocking IDAM to reach a page |
| In-process integration | `src/integration-test` | `yarn test:integration` | Supertest against the app. Multi-step redirects, cookies, session, rendered HTML, middleware wiring. External I/O still mocked (Redis, Civil Service, IDAM). | Duplicating every page GET/POST already owned by a unit handler test |
| Browser functional | `src/test/functionalTests` | `yarn test:functional` / reduced-stack | Browser, session and real- or WireMock-backed journeys | Assertions that only need a controller or a route |

`yarn test:integration` invokes `yarn test:routes`.

## Where unit coverage runs

PRs run the existing unit suite in the CI workflow's `Unit tests` job, including Renovate PRs. It checks out the PR head so coverage matches Jenkins, builds assets required by the existing fixtures, uses two Jest workers, and publishes LCOV plus a commit/run-attempt manifest after success. It does not run integration or browser journeys. This follows the completed test-layer cleanup under DTSCCI-1961/6275–6282; DTSCCI-1832 continues to own assertion cleanup. It does not restore the integration tests removed from Actions under DTSCCI-5190.

Before its test stage, Jenkins waits up to ten minutes for the same PR commit's successful CI run and downloads that attempt's coverage using the existing GitHub credential. The credential is not forwarded to artifact storage. Only the known report files are read from the archive, and the commit, run, attempt and report checksum must match before Sonar uses them. Missing, expired or invalid reports and failed/cancelled Actions runs fail the stage; they never become a successful test skip. Rerun Actions if its 14-day artifact has expired.

The shared pipeline still calls `yarn test:coverage`. In this verified PR handoff it checks the downloaded report instead of running Jest again. Local, master, tag and other non-PR runs retain the full coverage command with eight workers by default (`JEST_MAX_WORKERS` can override this). Sonar stays in Jenkins with `coverage/lcov.info`; integration, accessibility and functional ownership is unchanged.

## Unit tests

A unit test isolates one unit. Controllers are units: extract the GET/POST handler from the Router and call it with mock `req` / `res` / `next`.

Reference: `src/test/utils/getRouteHandler.ts` (used from converted controller tests).

```ts
const getHandler = getRouteHandler(controller, 'get');

await getHandler(req as Request, res as Response, next);

expect(res.render).toHaveBeenCalledWith('the-view', expect.objectContaining({...}));
```

Guards and services stay as direct function calls with mocked draft store / clients.

Do not import `src/main/app` from a unit test unless the unit under test is the app module itself (for example middleware registration order). Even then, prefer inspecting the stack without HTTP.

## Integration tests

An integration test proves that routing, middleware, Nunjucks and guards work together for a journey.

Reference: `src/integration-test/routes/eligibility/eligibility.integration.test.ts`.

Keep these tests journey-shaped: happy path plus one validation, redirect or error case. Do not recreate a unit test per field.

Existing journey owners:

| Journey | Owner |
| --- | --- |
| Eligibility decision matrix | `src/integration-test/routes/eligibility/eligibility.integration.test.ts` |
| Claim issue | `src/integration-test/routes/claim/claimIssue.integration.test.ts` |
| Claim-issue dashboard notifications | `src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts` |
| Case progression dashboard | `src/integration-test/routes/dashboard/caseProgressionDashboard.integration.test.ts` |
| Mediation dashboard | `src/integration-test/routes/dashboard/mediationDashboard.integration.test.ts` |
| View claimant information | `src/integration-test/routes/dashboard/viewClaimantInformation.integration.test.ts` |
| Hearing-fee payment | `src/integration-test/routes/payment/hearingFeePayment.integration.test.ts` |
| Query management | `src/integration-test/routes/queryManagement/qm.integration.test.ts` |
| Defendant reject-all | `src/integration-test/routes/response/rejectAll.integration.test.ts` |
| Defendant admission and statement of means | `src/integration-test/routes/response/admission.integration.test.ts` |
| Small-claims directions questionnaire | `src/integration-test/routes/directionsQuestionnaire/smallClaims.integration.test.ts` |
| Claimant reject-all | `src/integration-test/routes/claimantResponse/rejectAll.integration.test.ts` |
| General application | `src/integration-test/routes/generalApplication/generalApplicationJourney.integration.test.ts` |
| Auth, health and public pages | `src/integration-test/routes/public/authHealthPublic.integration.test.ts` |
| Claimant paid-in-full response | `src/integration-test/routes/claimantResponse/paidInFull.integration.test.ts` |
| Mediation contact details | `src/integration-test/routes/mediation/mediation.integration.test.ts` |
| Case progression trial arrangements, documents and reconsideration | `src/integration-test/routes/caseProgression/caseProgression.integration.test.ts` |
| Defendant response contact details and deadlines | `src/integration-test/routes/response/responseContactDeadlines.integration.test.ts` |
| Dashboard defendant information and notification redirect | `src/integration-test/routes/dashboard/dashboardPages.integration.test.ts` |
| Settlement agreement | `src/integration-test/routes/settlementAgreement/settlementAgreement.integration.test.ts` |
| View mediation documents | `src/integration-test/routes/document/document.integration.test.ts` |
| Help with fees and judgment confirmation | `src/integration-test/routes/features/remainingPages.integration.test.ts` |
| Monthly income and expense calculation | `src/integration-test/routes/calculateMonthlyExpense/monthlyIncomeExpense.integration.test.ts` |
| Draft-store / GA / payment-session TTL | `src/integration-test/modules/draft-store/` |

If a journey has an owner in this table, do not add new `request(app)` tests under `src/test/unit` for the same behaviour. Convert or delete the unit HTTP tests instead.

If a journey has no owner, add the integration test first, then convert the unit file.

The claim-issue dashboard integration owner is notification rendering only. Other dashboard branches call the route handler. View defendant information and one notification redirect are owned by `dashboardPages.integration.test.ts`.

Claim-issue pages (task list, party type, amount, CYA, confirmation, and the rest of `src/test/unit/routes/features/claim/` excluding general application) are owned by `src/integration-test/routes/claim/claimIssue.integration.test.ts`.

Defendant full admission, part admission, and statement of means are owned by `src/integration-test/routes/response/admission.integration.test.ts`. That suite is a happy path plus one validation error and one guard redirect. Matching unit tests are the files under `admission/fullAdmission`, `admission/partialAdmission`, `statementOfMeans`, `financial-details`, and `citizenResponseType`. Those unit tests call the route handler and must not use `request(app)`.

Contact details, deadlines, confirmation, and the other response pages are owned by `src/integration-test/routes/response/responseContactDeadlines.integration.test.ts`. That suite requests extra time, rejects a blank date of birth, and redirects "up to 28 days" to the task list. The matching unit tests under `src/test/unit/routes/features/response/` call the route handler. The check-answers redirect into the PCQ journey is the `isFirstTimeInPCQ` guard, covered by `src/test/unit/routes/guards/pcqGuard.test.ts`.

Small-claims directions questionnaire pages under `src/test/unit/routes/features/directionsQuestionnaire/` are owned by `src/integration-test/routes/directionsQuestionnaire/smallClaims.integration.test.ts`. That suite is the representative small-claims path plus one validation error. Those unit tests call the route handler and must not use `request(app)`.

General application pages under `src/test/unit/routes/features/claim/generalApplication/` are owned by `src/integration-test/routes/generalApplication/generalApplicationJourney.integration.test.ts`. That suite is an applicant happy path, a respondent happy path, and one validation error. Those unit tests call the route handler and must not use `request(app)`. `generalApplication.integration.test.ts` remains a controller-level slice for application-type branches.

Auth, health, first contact, and the public pages for privacy, terms, cookies, contact us, accessibility, the Civil National Business Centre, and the Small Claims Mediation Service are owned by `src/integration-test/routes/public/authHealthPublic.integration.test.ts`. That suite checks health up and down, the public pages, a Welsh language render, cookie preferences, one first-contact validation error, and sign-in wiring. The matching unit tests call the route handler or the OIDC middleware directly and must not use `request(app)`. `claimIssueTaskListGuard` is called as a function. Express static-before-session order is asserted from the app stack in `src/integration-test/setup/app.middlewareOrder.integration.test.ts`.

Claimant-response pages other than reject-all are owned by `src/integration-test/routes/claimantResponse/paidInFull.integration.test.ts`. That suite is a settlement date, the confirmation page, and one validation error. Reject-all stays owned by `rejectAll.integration.test.ts`. The unit tests under `src/test/unit/routes/features/claimantResponse/` call the route handler and must not use `request(app)`.

Mediation pages other than the dashboard are owned by `src/integration-test/routes/mediation/mediation.integration.test.ts`. That suite is free telephone mediation, continuing from telephone mediation, and one validation error on the company phone. The unit tests under `src/test/unit/routes/features/mediation/` call the route handler and must not use `request(app)`.

Case progression pages other than the dashboard and hearing fee are owned by `src/integration-test/routes/caseProgression/caseProgression.integration.test.ts`. That suite is trial arrangements with one validation error, the upload-documents start page, and a request to review an order. Hearing fee stays owned by `hearingFeePayment.integration.test.ts`. The unit tests under `src/test/unit/routes/features/caseProgression/` outside `hearingFee/` call the route handler and must not use `request(app)`.

The defendant settlement agreement is owned by `src/integration-test/routes/settlementAgreement/settlementAgreement.integration.test.ts`. That suite opens the sign page and posts with no option selected. The unit tests call the route handler.

View mediation documents is owned by `src/integration-test/routes/document/document.integration.test.ts`. Document download and document view call the route handler and assert the response headers and body.

Help with fees and the "you've been paid" confirmation are owned by `src/integration-test/routes/features/remainingPages.integration.test.ts`. The monthly income and expense total is owned by `src/integration-test/routes/calculateMonthlyExpense/monthlyIncomeExpense.integration.test.ts`. Claim assignment, back, and cancel only redirect, so their unit tests call the handler. Helmet and the language cookie call their middleware directly.

## Accessibility and tooling regressions

The mocked-page browser runner lives in `src/test/a11y`, separate from Jest unit and route discovery. Build development assets before running it. `captureServer.ts` requires the built CSS/JS, serves public assets/fonts, supplies the capture language cookie, installs the official GOV.UK bootstrap and owns startup/shutdown. Its route-level support is tested in `src/integration-test/routes/accessibilityCaptures.integration.test.ts`. Production macro/header compatibility and broader presentation comparisons belong to the Nunjucks unit suites; a passing static HTML comparison does not prove browser initialization.

Pa11y 10 uses the locked Puppeteer browser. `captureBrowser.ts` owns a fresh browser per attempt, restricts page requests to the capture origin/data URLs, bounds launch/work/cleanup and closes or kills only that owned browser. It retries incomplete browser/scan failures up to three times. Once a scan completes, its result is validated outside the retry loop even if browser cleanup fails; cleanup failure fails the test without another scan, and both errors are reported if validation also fails. The outer per-capture Mocha timeout includes the attempt and cleanup budget. `src/test/unit/a11y/captureBrowser.test.ts` checks that lifecycle with substituted browser operations; the browser runner separately asserts real GOV.UK conditional interaction. A missing built asset fails setup and is not evidence of an accessibility violation or a diagnosis of pipeline flakiness.

Tooling regressions under `src/test/unit/bin` may start a contained Node subprocess when native module loading is the contract under test. `codeceptPluginLoading.test.ts` exercises the installed CodeceptJS loader and the configured functional reporting plugin, then checks failed, passed/retried and unexecuted file reports using Codecept-created scenario identities. The regression awaits reporting handlers directly; full worker execution is a separate check. It blocks socket connections, uses disposable output and starts no browser or application server. `checkYarnAudit.test.ts` exercises the real checker against synthetic audit output, including production-advisory rejection and changed/stale deprecation records; it is not a live audit.

The isolated `propertiesVolume.test.ts` tests actual mounted-secret parsing with temporary files and a fake config, including absent-volume defaults. `azureIdentityCompatibility.test.ts` substitutes the HTTP transport. `uploadRateLimitStore.test.ts` substitutes Redis commands to distinguish NOSCRIPT recovery from an ambiguous connection failure. These protect dependency adapters without contacting a secret store, identity endpoint or Redis server. They do not establish live-service compatibility.

`modules/appinsights/liveMetricsRedaction.test.ts` executes the installed Azure Monitor entry points with startup side effects replaced, then uses their processor order with real in-memory OpenTelemetry providers and Live Metrics document conversion. It checks native OpenTelemetry records and actual Application Insights `trackException`/`trackTrace` records, including redaction failure, without starting SDK network clients. Both CommonJS and ESM conversion paths are exercised. The scoped Yarn patch for `@azure/monitor-opentelemetry` 1.20.1 runs configured redaction before Live Metrics copies records as well as before normal export. It also reads manual SDK messages, exception types and stack details from their legacy body format without altering normal exports. Live Metrics remains enabled. Review this patch and its resolution when upgrading Application Insights; remove it only when the installed SDK preserves both ordering and record compatibility without it. These tests do not establish delivery to Azure.

## Jest retries

`jest.retryTimes` is for integration flakiness only. Unit setup (`jest.setup.js`) does not retry. Integration retries live in `jest.functionaltest.setup.js`, which is loaded only by `jest.functionaltest.config.js`.

## Converting an existing HTTP unit test

1. Check the table above (or add a thin integration test if the journey is missing).
2. Keep handler-level assertions in `src/test/unit` (render, redirect, `next(error)`).
3. Remove `supertest`, `request(app)`, IDAM nock used only to reach the page, and `res.text` HTML assertions that the integration suite already covers.
4. Do not delete the only in-process coverage for a page. Integration first, then strip HTTP from unit.

## Pipeline note

`yarn test:coverage` runs `LOG_LEVEL=OFF node --disable-warning=DEP0060 --no-sparkplug ./node_modules/jest/bin/jest.js --coverage --maxWorkers=8 --silent`. Jest loads `jest.config.js`, so the roots are `src/test/unit`. The run writes `coverage/lcov.info` for Sonar and exits non-zero when a test fails. `yarn test` prints a message and exits. The shared Node.js pipeline calls `yarn test` and then `yarn test:coverage`, so the unit suite runs once in that stage.

`yarn test:integration` uses `jest.functionaltest.config.js` (`src/integration-test` only). Jenkins `afterSuccess('build')` runs `yarn build` and then `yarn test:integration`. `cichecks` runs `test:coverage` and then `test:routes`. `Jenkinsfile_CNP` does not call `cichecks`.
