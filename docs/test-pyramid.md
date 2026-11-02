# CUI test pyramid

This is the coverage-ownership contract for in-process tests. Follow it when adding or converting tests. It is the delivery of the DTSCCI-1961 spike follow-up: unit tests must not boot the Express app.

Related: [functional-tests.md](functional-tests.md) covers browser journeys and preview execution. This document owns unit vs in-process integration.

## Layers

| Layer | Location | Command | Allowed | Not allowed |
| --- | --- | --- | --- | --- |
| Unit | `src/test/unit` | `yarn test:coverage` (and `yarn test` once restored) | Call a handler, service, guard or model with mocked collaborators. Assert `res.render`, `res.redirect`, `next`, return values. | `request(app)`, `supertest`, `supertest-session`, importing `src/main/app` to hit HTTP, nocking IDAM to reach a page |
| In-process integration | `src/integration-test` | `yarn test:integration` | Supertest against the app. Multi-step redirects, cookies, session, rendered HTML, middleware wiring. External I/O still mocked (Redis, Civil Service, IDAM). | Duplicating every page GET/POST already owned by a unit handler test |
| Browser functional | `src/test/functionalTests` | `yarn test:functional` / reduced-stack | Browser, session and real- or WireMock-backed journeys | Assertions that only need a controller or a route |

`yarn test:routes` is an alias of `yarn test:integration`.

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

## Jest retries

`jest.retryTimes` is for integration flakiness only. It still lives in `jest.setup.js` because that file is shared by unit and integration. `request(app)` has left `src/test/unit`. Three unit files still boot a session with `supertest-session`: `dashboardController.test.ts`, `claimSummaryController.test.ts`, and `confirmYouHaveBeenPaidController.test.ts`. After those have left the unit folder, remove retries from unit setup and keep them on `jest.functionaltest.config.js` if they are still required.

## Converting an existing HTTP unit test

1. Check the table above (or add a thin integration test if the journey is missing).
2. Keep handler-level assertions in `src/test/unit` (render, redirect, `next(error)`).
3. Remove `supertest`, `request(app)`, IDAM nock used only to reach the page, and `res.text` HTML assertions that the integration suite already covers.
4. Do not delete the only in-process coverage for a page. Integration first, then strip HTTP from unit.

## Pipeline note

`yarn test` is currently a no-op (`echo`). `request(app)` has left `src/test/unit`. Do not restore `yarn test` until the three `supertest-session` controller tests have left as well, because running the app from the unit suite twice leaked memory. `yarn test:coverage` remains the suite that executes unit tests in CI.
