# CUI test pyramid

This is the coverage-ownership contract for in-process tests. Follow it when adding or converting tests. It is the delivery of the DTSCCI-1961 spike follow-up: unit tests must not boot the Express app.

Related: [functional-test-migration-matrix.md](functional-test-migration-matrix.md) owns browser-journey layering. This document owns unit vs in-process integration.

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
| Claim-issue dashboard notifications | `src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts` |
| Case progression dashboard | `src/integration-test/routes/dashboard/caseProgressionDashboard.integration.test.ts` |
| Mediation dashboard | `src/integration-test/routes/dashboard/mediationDashboard.integration.test.ts` |
| View claimant information | `src/integration-test/routes/dashboard/viewClaimantInformation.integration.test.ts` |
| Hearing-fee payment | `src/integration-test/routes/payment/hearingFeePayment.integration.test.ts` |
| Query management | `src/integration-test/routes/queryManagement/qm.integration.test.ts` |
| Defendant reject-all | `src/integration-test/routes/response/rejectAll.integration.test.ts` |
| Claimant reject-all | `src/integration-test/routes/claimantResponse/rejectAll.integration.test.ts` |
| General application (thin slice) | `src/integration-test/routes/generalApplication/generalApplication.integration.test.ts` |
| Draft-store / GA / payment-session TTL | `src/integration-test/modules/draft-store/` |

If a journey has an owner in this table, do not add new `request(app)` tests under `src/test/unit` for the same behaviour. Convert or delete the unit HTTP tests instead.

If a journey has no owner, add the integration test first, then convert the unit file.

The claim-issue dashboard integration owner is notification rendering only. `src/test/unit/routes/features/dashboard/claimantDashboardController.test.ts` still uses HTTP for other dashboard branches; converting that file is a follow-up, not part of the already-owned-journey conversion.

## Jest retries

`jest.retryTimes` is for integration flakiness only. It still lives in `jest.setup.js` because that file is shared by unit and integration, and hundreds of HTTP tests remain under `src/test/unit`. After those tests have left the unit folder, remove retries from unit setup and keep them on `jest.functionaltest.config.js` if they are still required.

## Converting an existing HTTP unit test

1. Check the table above (or add a thin integration test if the journey is missing).
2. Keep handler-level assertions in `src/test/unit` (render, redirect, `next(error)`).
3. Remove `supertest`, `request(app)`, IDAM nock used only to reach the page, and `res.text` HTML assertions that the integration suite already covers.
4. Do not delete the only in-process coverage for a page. Integration first, then strip HTTP from unit.

## Pipeline note

`yarn test` is currently a no-op (`echo`) because the unit folder still contains hundreds of HTTP tests and running them twice leaked memory. Do not restore `yarn test` until those tests have left `src/test/unit`. `yarn test:coverage` remains the suite that executes unit tests in CI.
