# CUI test pyramid

This is the coverage-ownership contract for in-process tests. Follow it when adding or converting tests. Unit tests must not boot the Express app.

Related: [functional-tests.md](functional-tests.md) covers browser journeys and preview execution. This document owns unit vs in-process integration.

## Layers

| Layer | Location | Command | Allowed | Not allowed |
| --- | --- | --- | --- | --- |
| Unit | `src/test/unit` | `yarn test:coverage` (or `yarn test`) | Call a handler, service, guard or model with mocked collaborators. Assert `res.render`, `res.redirect`, `next`, return values. | `request(app)`, `supertest`, `supertest-session`, importing `src/main/app` to hit HTTP, nocking IDAM to reach a page |
| In-process integration | `src/integration-test` | `yarn test:integration` | Supertest against the app. Multi-step redirects, cookies, session, rendered HTML, middleware wiring. External I/O still mocked (Redis, Civil Service, IDAM). | Duplicating every page GET/POST already owned by a unit handler test |
| Browser functional | `src/test/functionalTests` | `yarn test:functional` / reduced-stack | Browser, session and real- or WireMock-backed journeys | Assertions that only need a controller or a route |

`yarn test:integration` invokes `yarn test:routes`.

## Unit tests

The unit Jest configuration sets `TZ=UTC` before loading test environments. Date-model tests therefore use the same timezone on every host; suites that depend on the current date must still freeze and restore their clocks. This test-only setting does not change the application's timezone.

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
| Draft-store / GA / payment-session TTL | `src/integration-test/modules/draft-store/` |

If a journey has an owner in this table, do not add new `request(app)` tests under `src/test/unit` for the same behaviour. Convert or delete the unit HTTP tests instead.

If a journey has no owner, add the integration test first, then convert the unit file.

The claim-issue dashboard integration owner is notification rendering only. `src/test/unit/routes/features/dashboard/claimantDashboardController.test.ts` still uses HTTP for other dashboard branches; converting that file is a follow-up, not part of the claim-issue journey conversion.

Claim-issue pages (task list, party type, amount, CYA, confirmation, and the rest of `src/test/unit/routes/features/claim/` excluding general application) are owned by `src/integration-test/routes/claim/claimIssue.integration.test.ts`.

Defendant full admission, part admission, and statement of means are owned by `src/integration-test/routes/response/admission.integration.test.ts`. That suite is a happy path plus one validation error and one guard redirect. Matching unit tests are the files under `admission/fullAdmission`, `admission/partialAdmission`, `statementOfMeans`, `financial-details`, and `citizenResponseType`. Those unit tests call the route handler and must not use `request(app)`. Contact details, deadlines, confirmation, and other response pages are not part of this owner.

Small-claims directions questionnaire pages under `src/test/unit/routes/features/directionsQuestionnaire/` are owned by `src/integration-test/routes/directionsQuestionnaire/smallClaims.integration.test.ts`. That suite is the representative small-claims path plus one validation error. Those unit tests call the route handler and must not use `request(app)`.

General application pages under `src/test/unit/routes/features/claim/generalApplication/` are owned by `src/integration-test/routes/generalApplication/generalApplicationJourney.integration.test.ts`. That suite is an applicant happy path, a respondent happy path, and one validation error. Those unit tests call the route handler and must not use `request(app)`. `generalApplication.integration.test.ts` remains a controller-level slice for application-type branches.

Auth, health, first contact, and the public pages for privacy, terms, cookies, contact us and accessibility are owned by `src/integration-test/routes/public/authHealthPublic.integration.test.ts`. That suite checks health up and down, the public pages, a Welsh language render, cookie preferences, one first-contact validation error, and sign-in wiring. The matching unit tests call the route handler or the OIDC middleware directly and must not use `request(app)`. `claimIssueTaskListGuard` is called as a function. Express static-before-session order is asserted from the app stack in `src/integration-test/setup/app.middlewareOrder.integration.test.ts`.

## Accessibility and tooling regressions

The mocked-page browser runner lives in `src/test/a11y`, separate from Jest unit and route discovery. Build development assets before running it. `captureServer.ts` requires the built CSS/JS, serves public assets/fonts, supplies the capture language cookie, installs the official GOV.UK bootstrap and owns startup/shutdown. Its route-level support is tested in `src/integration-test/routes/accessibilityCaptures.integration.test.ts`. Production macro/header compatibility and broader presentation comparisons belong to the Nunjucks unit suites; a passing static HTML comparison does not prove browser initialization.

Pa11y 10 uses the locked Puppeteer browser. `captureBrowser.ts` owns a fresh browser per attempt, restricts page requests to the capture origin/data URLs, bounds launch/work/cleanup and closes or kills only that owned browser. It retries browser/scan failures up to three times; completed accessibility assertions remain outside the retry loop. The outer per-capture Mocha timeout includes the attempt and cleanup budget. `src/test/unit/a11y/captureBrowser.test.ts` checks that lifecycle with substituted browser operations; the browser runner separately asserts real GOV.UK conditional interaction. A missing built asset fails setup and is not evidence of an accessibility violation or a diagnosis of pipeline flakiness.

Tooling regressions under `src/test/unit/bin` may start a contained Node subprocess when native module loading is the contract under test. `codeceptPluginLoading.test.ts` exercises the installed CodeceptJS loader and the configured functional reporting plugin, then checks failed, passed/retried and unexecuted file reports using Codecept-created scenario identities. The regression awaits reporting handlers directly; full worker execution is a separate check. It blocks socket connections, uses disposable output and starts no browser or application server. `checkYarnAudit.test.ts` exercises the real checker against synthetic audit output, including production-advisory rejection and changed/stale deprecation records; it is not a live audit.

The isolated `propertiesVolume.test.ts` tests actual mounted-secret parsing with temporary files and a fake config, including absent-volume defaults. `azureIdentityCompatibility.test.ts` substitutes the HTTP transport. `uploadRateLimitStore.test.ts` substitutes Redis commands to distinguish NOSCRIPT recovery from an ambiguous connection failure. These protect dependency adapters without contacting a secret store, identity endpoint or Redis server. They do not establish live-service compatibility.

## Jest retries

`jest.retryTimes` is for integration flakiness only. It still lives in `jest.setup.js` because that file is shared by unit and integration, and hundreds of HTTP tests remain under `src/test/unit`. After those tests have left the unit folder, remove retries from unit setup and keep them on `jest.functionaltest.config.js` if they are still required.

## Converting an existing HTTP unit test

1. Check the table above (or add a thin integration test if the journey is missing).
2. Keep handler-level assertions in `src/test/unit` (render, redirect, `next(error)`).
3. Remove `supertest`, `request(app)`, IDAM nock used only to reach the page, and `res.text` HTML assertions that the integration suite already covers.
4. Do not delete the only in-process coverage for a page. Integration first, then strip HTTP from unit.

## Pipeline note

`yarn test` and `yarn test:coverage` both execute Jest using the tracked package scripts. The unit folder still contains legacy HTTP suites, so the ownership rules above govern new work and gradual conversion. `yarn test:integration` executes the separate in-process journey suite. Do not add another aggregate invocation that needlessly runs the same suites twice.
