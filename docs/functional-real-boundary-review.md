# DTSCCI-5979: retained-service review

This review reconciles the six historical PR/master journeys assigned to DTSCCI-5979 with the complete baseline delivered by DTSCCI-6133. All six already run in both modes. Their scenario bodies, helpers, assertions and selection are unchanged. The classification now records their delivered thin-client execution instead of proposing an assertion split under the completed Welsh ticket.

The four response journeys already delivered by DTSCCI-6157 also had stale migration-required classifications. Those entries now retain their original delivery ownership and record the delivered execution model. The generator checks every active historical baseline identity, so all fourteen must have exactly one migrated classification. This corrects omissions from the completed migration batches; it does not introduce another migration batch.

Defendant linking is excluded: it was added after the historical snapshot and remains on-demand coverage. Bundles are also outside this batch. Their separate classification does not represent an unfinished PR/master migration.

## Scenario evidence

Paths below are relative to `src/test/functionalTests/tests/ui_tests/`. Existing synchronous Fees, Payments/GovPay, Docmosis and CDAM mocks are reused. CUI address lookup is also mocked. No scenario-specific fallback response or new skip is introduced.

| Scenario | Observable assertion requiring the retained boundary |
| --- | --- |
| `case-struck-out/cp_LiPvLiP_case_struck_out_fast_track_tests.js#1` | After hearing-fee-unpaid processing, `verifyNotificationTitleAndContent` and `verifyTasklistLinkAndState` check the struck-out notice and inactive hearing tasks for both parties. Civil Service/CCD/Camunda produce the persisted state and dashboard data. |
| `create-claim/IndividualvsIndividual_tests.js#1` | `verifyAndPayClaimFee` observes issued-claim payment; `askForMoreTimeCourtOrderGA` checks application pages and payment confirmation for both claimant and defendant. Civil Service/CCD/Camunda persist the claim, applications and their access. The payment-provider responses themselves are mocked. |
| `ga/LiPvLiP_GA_DismissAnOrder_tests.js#1` | `makeOrderGA` drives the real decision workflow; `verifyNotificationTitleAndContent` checks the resulting order-made notification on the parent claim. Civil Service/CCD/Camunda remain real. |
| `hearings/cp_LiPvLiP_hearing_fee_tests_fast_track_tests.js#2` | After the mocked payment sequence, `verifyTasklistLinkAndState` checks `Done`; `api.assertEmailSent` checks Civil Service's notification audit. Civil Service/CCD/Camunda must process the payment result. Neither payment-provider settlement nor inbox delivery is asserted. |
| `noc/LipVLR_NoC_e2e_tests.js#1` | `requestNoticeOfChangeForRespondent1Solicitor` checks the new organisation in CCD. `checkUserCaseAccess` checks the citizen loses access and the solicitor gains it. `defendantLRResponse` waits for the resulting workflow state. AAC, professional reference data, CCD and role assignment support actual access replacement; Civil Service/Camunda process the response. |
| `qm/qm_Hearing_LiPvLiP_followUp_tests.js#1` | `verifyFollowUpMessage` observes persisted conversations for each party and `verifyClosedQuery` observes the caseworker's closure. Civil Service/CCD and party access are retained. Work Allocation is disabled in preview and is not required by these assertions. |

Setup actions are not independent coverage. They create the same cases, users and workflows subsequently observed by these assertions; replacing them with disconnected canned IDs would break that relationship. This review does not rewrite setup helpers or browser assertions.

## Deployment decisions

| Component | Decision and reason |
| --- | --- |
| CUI and Redis | Retain the real browser-facing application, sessions and drafts. |
| Civil Service, CCD data/definition stores, Camunda and PostgreSQL | Retain persisted claims/applications, case definitions, callbacks and asynchronous workflow state observed above. |
| CCD search/indexing | Retain case discovery used by the party dashboards; it must reflect the cases created by the journeys. |
| AAC and role assignment | Retain genuine NoC access changes and party access to cases. |
| IDAM/S2S | Retain the identities and service authentication used by the real case/access services. The CCD gateway OAuth/S2S credentials are still used by direct definition-import scripts; disabling the browser gateway does not remove those credentials. |
| IDAM preview registration | Retain: despite its `xui-idam-pr` name, its redirect list registers the **Civil Citizen UI** callback as well as XUI. |
| CCD browser API gateway | Disable in the optimised overlay. `Jenkinsfile_CNP:setUrls`, API helpers and definition-import scripts use direct Civil Service, CCD and AAC endpoints. XUI is already disabled and no baseline assertion uses the gateway. |
| XUI, EM stitching, EM CCD orchestration and deployed CDAM | Already disabled in the optimised overlay. Existing Docmosis/CDAM mappings supply document responses. |
| Work Allocation and service bus | Already disabled by base preview configuration; do not describe them as required by query-management assertions. |

Shared AAT services remain outside the per-PR deployment: identity/authentication, professional and location reference data, and notification infrastructure. The existing location catalogue supports the unchanged court-selection journeys and professional data supports NoC organisations. These are not additional deployed preview components. Notification assertions use Civil Service's audit; the current backend constructs its Notify client from the API key without a configurable base URL, so redirecting that client would require a separate backend configuration change. This review does not claim that every network call made by the retained backend is intercepted by WireMock.

The gateway removal applies only to `values.optimisedTests.preview.template.yaml`. Standard deployment and scenario routing tags are unchanged. The default-path cutover remains DTSCCI-6134.

## Parallel execution

The optimised runner gives each baseline file its own worker: 18 workers for PR (14 active journeys and five existing skips across four other files), and 16 for master. It retains the standard PR runner's 3-second stagger. Codecept normally allocates suites before applying grep, allowing unrelated suites to leave workers idle while long baseline journeys queue together. Only verified baseline files enter optimised worker allocation; the full-source inventory check runs first and ignores that narrower worker plan. Both modes still select exactly the same scenario identities. The per-test global WireMock reset is removed: payment creation, card entry, confirmation and status reads use a unique payment reference, with independent state held by the official WireMock state extension. Opening the confirmation page leaves payment Initiated; clicking Confirm changes only that payment to Success. Repeated status reads preserve success. Unknown references, mismatched amounts/return URLs and completion before confirmation are unmatched.

WireMock 3.13.2 and state extension 0.10.1 are pinned for local/preview execution. The extension is downloaded outside the checkout and SHA-256 verified before Java loads it. The preview remains one mock instance (autoscaling disabled); workers share it safely through separate payment contexts. State expires after the extension's default one hour. No application or functional journey assertions are changed.

`yarn test:wiremock-contracts` now creates 36 concurrent payments spanning all four fee types, including unfinished payments for the same case. It completes half the payments (covering every fee type) in reverse order and repeatedly checks that the others remain Initiated. It also enforces that optimised worker capacity is at least standard capacity.

For comparable whole-pipeline measurements, apply `benchmarkPipeline` alongside `runAllFunctionalTests` in both modes. This sets the shared pipeline's `NO_SKIP_IMG_BUILD` override so both runs execute build, unit/integration checks and image stages rather than comparing an uncached run to a cached one. Remove the benchmark label after verification. Record total and functional durations, cache conditions and any infrastructure queue delays; the optimised result must not regress.

Accessibility also installs the Chrome version pinned by the local Puppeteer package before starting its four workers. This handles fresh Jenkins agents that restore Node dependencies without the browser cache and prevents every page check from retrying a missing executable. Both deployment modes use this preflight; accessibility assertions are unchanged.

## Verification

Run `yarn test:generate:functional-classification`, `yarn test:functional-classification` and `yarn test:functional-baseline`. The classification check requires every reviewed identity to resolve to an active PR baseline scenario and every active historical baseline identity to have exactly one migrated classification. Render standard and optimised charts to verify that the gateway disappears only from the latter. Run the complete baseline in both Jenkins modes, compare their `baseline-results.json` artifacts using `bin/functional-baseline.js compare`, and check optimised WireMock diagnostics for unmatched requests.

This ticket does not require QA-person involvement. Developer review and automated checks verify the unchanged behaviour and deployment change.
