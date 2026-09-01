# Functional test migration matrix

This document records the migration boundary for CUI functional coverage. The objective is a stable standard PR pipeline that runs as much coverage as safely possible without depending on AAT/shared Civil Service, CCD, Camunda or related downstream availability. Real full-stack execution is the reviewed exception, not the default classification.

Existing API setup is not coverage and does not justify retention. Compound journeys must be split so deterministic assertions move to reduced-stack, in-process or contract coverage even when one observable cross-service assertion is retained.

## Suite selection

| Suite | Selector | Command | Purpose |
| --- | --- | --- | --- |
| Reduced-stack browser | `@reduced-stack` | `yarn test:mocked-functional:browser` | Browser, session and multi-page CUI behaviour against deterministic WireMock responses |
| Reduced-stack create claim | `@reduced-stack-create-claim` | `npx codeceptjs run --grep '@reduced-stack-create-claim' --reporter mocha-multi --verbose` | The independently selectable first migration batch |
| Full-stack PR | `@civil-citizen-pr` | `yarn test:civil-citizen-pr` | Behaviour that depends on real service transitions or wiring |
| Full-stack nightly | `@civil-citizen-nightly` | `yarn test:civil-citizen-nightly` | Wider real-service regression coverage |
| Thin full-stack | `@thin-full-stack` | `yarn test:thin-full-stack` | Eight independently reported representative real-service risks; see [operating specification](thin-full-stack-functional-tests.md) |

`@mocked-functional` remains on migrated scenarios as a compatibility tag while callers move to the layer-specific `@reduced-stack` selector. The Allure feature name starts with `Reduced-stack` and the Mochawesome report is named `reduced-stack`, so the execution layer is visible in Jenkins artifacts.

## First batch: individual creates and submits a claim

Current reduced-stack owner: `src/test/functionalTests/tests/mocked/createClaim_tests.js`

Current full-stack source: `src/test/functionalTests/tests/ui_tests/create-claim/IndividualvsIndividual_tests.js`

| Current purpose or assertion | Target layer | Coverage owner | Reason and dependency boundary |
| --- | --- | --- | --- |
| Navigate from a draft through the multi-page individual/no-interest/no-HWF claim journey | Reduced-stack browser | `tests/mocked/createClaim_tests.js` | Browser navigation, form state and session behaviour add value; downstream responses are deterministic. |
| Submit through CUI and render the confirmation page and formatted claim reference | Reduced-stack browser | `tests/mocked/createClaim_tests.js` | Proves the public CUI journey reaches submission and renders the response. It does not claim that Civil Service completed a real workflow. |
| Claim-submission request shape and response handling at the CUI/Civil Service boundary | Pact | `src/test/contract/consumers/CivilServiceCreateClaim.test.ts` | A consumer contract is stronger and more focused than inferring the service contract from a canned browser response. |
| Submitted-claim dashboard content for no, standard and variable interest | In-process integration | `src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts` | Controller routing and Nunjucks combinations do not need a browser. |
| Claim-submitted controller rendering and redirect/error combinations | In-process route tests | `src/test/unit/routes/features/claim/claimSubmittedController.test.ts` | Server-rendered combinations and error handling do not need a browser. |
| Claim task-list guard combinations | In-process route tests | `src/test/unit/routes/guards/claimIssueTaskListGuard.test.ts` | Guard decisions are controller behaviour. |
| Real fee payment | Full-stack | `IndividualvsIndividual_tests.js` | Depends on GovPay/service state and must not be represented as a canned success. |
| Civil workflow completion and notification production | Full-stack | `IndividualvsIndividual_tests.js` | Depends on asynchronous processing and real service state transitions. |
| Defendant assignment | Full-stack | `IndividualvsIndividual_tests.js` | Depends on real role-assignment/service wiring. |
| Claimant and defendant general-application creation | Full-stack | `IndividualvsIndividual_tests.js` | GA is a separate cross-service workflow and is deliberately outside this mocked scenario. |

The reduced-stack scenario starts with CUI's public testing-support draft action and then uses browser-visible CUI behaviour. It does not call CCD, Camunda, Civil Service test-support APIs or assignment APIs. Its WireMock mappings are limited to postcode lookup, fee display, claim submission, claim lookup, user roles and the CUI dashboard notification request needed by this journey.

## Current scenario inventory

The authoritative scenario inventory is [functional-test-scenario-classification.csv](functional-test-scenario-classification.csv). The companion [assertion decision inventory](functional-test-assertion-classification.csv) separates hooks/setup, direct service checks and browser-visible steps so full-stack setup cannot be treated as retention evidence. Both are generated from executable Codecept declarations:

```bash
yarn test:generate:functional-classification
yarn test:functional-classification
```

The check runs in `cichecks` and fails when either inventory is stale. Scenario classifications are migration obligations, not claims that every scenario should remain a browser test: each DTSCCI-6133 batch must use the assertion inventory to select the lowest reliable layer and link the implemented replacement.

At classification time the executable suite contained:

| Measure | Count | Percentage of active |
| --- | ---: | ---: |
| Declared scenarios | 198 | — |
| Skipped declarations | 23 | — |
| Active scenarios classified | 174 | 100% |
| Must migrate off full-stack | 166 | 95.4% |
| Reduced-stack migration obligation | 160 | 92.0% |
| In-process integration obligation | 6 | 3.4% |
| Candidate retained thin full-stack exception | 8 | 4.6% |
| Material setup/assertion decisions | 1227 | — |

No active scenario may remain in the wider full-stack suite by default. The 160 reduced-stack rows are the browser-oriented starting backlog; assertion decisions may move individual checks further down to in-process/contract coverage or removal. `Pact` remains the authority for important CUI/Civil Service request/response contracts rather than a canned browser fixture.

### Proposed execution split

Primary target and execution frequency are separate decisions. A scenario may genuinely require real services without belonging in the small independently triggered full-stack smoke suite.

| Proposed execution decision | Scenarios | Purpose |
| --- | ---: | --- |
| Proposed thin full-stack exception | 8 | Representative cross-service assertions subject to DTSCCI-5974 review and thinning |
| Migrate off full-stack | 166 | All other active scenarios; delivery must choose reduced-stack, in-process, contract or removal at assertion level |
| Unreviewed wider full-stack allowance | 0 | No scenario is retained merely because its domain or setup uses real services |

The proposed thin set covers the minimum distinct real-service risks without retaining every variant:

| Risk category | Proposed source | Why real services are required |
| --- | --- | --- |
| Claim issue, payment, workflow, assignment and GA | `create-claim/IndividualvsIndividual_tests.js` | Observes fee payment, Camunda completion, defendant assignment and GA creation in one representative lifecycle |
| Role assignment / defendant linking | `defendant-linking/defendantLinkingThroughCUI_tests.js` | Confirms real case-user and role-assignment wiring |
| General Applications | `ga/LiPvLiP_GA_DismissAnOrder_tests.js` | Confirms a separate GA is created and progressed through real services |
| Document/bundle persistence | `bundles/cp_LiPvLiP_bundles_small_claims_tests.js` | Confirms generated documents are persisted and visible through CCD/document services |
| Hearing/payment progression | `hearings/cp_LiPvLiP_hearing_fee_tests_fast_track_tests.js` | Confirms hearing-fee payment and resulting case state across services |
| Query Management / Work Allocation | `qm/qm_Hearing_LiPvLiP_followUp_tests.js` | Confirms query routing and follow-up behaviour across CCD and WA |
| Notice of Change | `noc/LipVLR_NoC_e2e_tests.js` | Confirms organisation and role changes affect real case access |
| Scheduled/state transition | `case-struck-out/cp_LiPvLiP_case_struck_out_fast_track_tests.js` | Confirms asynchronous case-state and notification consequences |

The proposal selects one active scenario from each representative source, producing eight candidate exception scenarios across eight distinct cross-service risk categories. Even these scenarios must shed deterministic UI assertions during DTSCCI-6133. DTSCCI-5974 owns final approval of each remaining observable real-service assertion, trigger, gating and triage policy.

### Migration batches and ordering

| Order | Delivery | Scope | Dependency |
| ---: | --- | --- | --- |
| 1 | DTSCCI-6133: CUI-only guards and rendering | Move redirects, validation, controller and Nunjucks assertions to focused/in-process tests | Assertion inventory and existing coverage links |
| 2 | DTSCCI-6156, DTSCCI-6157 and DTSCCI-6258: claim creation and responses | Move all deterministic party variants, admissions, mediation choices and dashboard results to reduced-stack/in-process/Pact coverage | DTSCCI-5972 and DTSCCI-5975 foundations |
| 3 | DTSCCI-6259: progression, hearing and documents | Mock browser-visible task lists, notifications, uploads and rendered results; retain only separately reviewed persistence/payment transitions | Scenario-driven mappings and contract protection |
| 4 | DTSCCI-6260: GA, NoC, assignment and QM | Mock deterministic UI journeys and split the small observable wiring assertions into the DTSCCI-5974 exceptions | Service-owner review of exception assertions |
| 5 | DTSCCI-6261 and DTSCCI-6262: remaining variants and duplicate/setup removal | Resolve Welsh/track variants, API-only setup and duplicate assertions at the correct lower layer | No unresolved or generic full-stack classifications |
| 6 | DTSCCI-5974: thin full-stack | Finalise and thin the eight exception candidates; implement independent standard-pipeline trigger/reporting and evidence | CUI engineering, QA and delivery-lead approval |
| 7 | DTSCCI-6134: default PR cutover | Make the approved mocked/in-process suite the ordinary PR route without AAT/shared downstream dependency | All migration and stability gates complete |

Every one of the 166 migration obligations must be implemented or have a specifically approved, dated exception. A whole domain cannot be exempted. Each batch updates both generated inventories and links replacement coverage before duplicate full-stack PR execution is removed.

## Old-versus-new coverage comparison

| Check | Existing full-stack journey | Reduced-stack journey | Decision |
| --- | --- | --- | --- |
| Browser claim form and task-list navigation | Covered | Covered | Candidate for duplicate PR execution removal only after the stability gate and QA approval |
| Claim submission and confirmation rendering | Covered as part of a larger journey | Covered with deterministic response | Candidate for duplicate PR execution removal only after the stability gate and QA approval |
| Real payment | Covered | Not asserted | Retain full-stack |
| Asynchronous workflow and notifications | Covered | Not asserted | Retain full-stack |
| Assignment | Covered | Not asserted | Retain full-stack |
| General applications | Covered | Not asserted | Retain full-stack |
| CUI/Civil request contract | Indirectly exercised | Canned response only | Owned by Pact; the browser test must not claim this coverage |
| Rendering/routing variants | Partially exercised | One representative path | Owned by route and integration tests |

## Migration evidence ledger

Do not remove duplicate PR execution until every required entry below is complete on one commit.

| Evidence | Required record | Status |
| --- | --- | --- |
| Baseline purpose, setup and assertions | Matrix above | Complete |
| Dependencies and known failure modes | Reduced-stack uses preview CUI, IDAM and WireMock; full-stack additionally waits on workflow, payment, assignment and GA. Reduced-stack builds 2–11 averaged 604 seconds (range 477–1099 seconds) with no first-attempt failures. | Complete for reduced-stack; full-stack baseline pending |
| Same-revision old/new comparison | Jenkins URLs, commit SHA, outcomes, durations and Allure links for both suites | Pending |
| Ten consecutive first-attempt reduced-stack runs | Ten rows in the run table below, all using one Jenkins revision | Complete |
| WireMock request journal | Archived `test-results/functional/wiremock` link for each reduced-stack run; expected submission and lookup counts and zero unmatched requests | Complete; journals linked below |
| QA approval | One-off preview comparison of the migrated browser journey | Pending |
| Duplicate PR execution removal | Follow-up change and coverage-owner review after all gates pass | Not started |

### Ten-run table

| Run | Commit | Jenkins build | First-attempt result | Duration | Allure | WireMock journal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [2](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/2/) | SUCCESS | 1099s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/2/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/2/artifact/test-results/functional/wiremock/request-journal.json) |
| 2 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [3](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/3/) | SUCCESS | 496s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/3/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/3/artifact/test-results/functional/wiremock/request-journal.json) |
| 3 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [4](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/4/) | SUCCESS | 558s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/4/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/4/artifact/test-results/functional/wiremock/request-journal.json) |
| 4 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [5](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/5/) | SUCCESS | 477s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/5/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/5/artifact/test-results/functional/wiremock/request-journal.json) |
| 5 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [6](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/6/) | SUCCESS | 557s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/6/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/6/artifact/test-results/functional/wiremock/request-journal.json) |
| 6 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [7](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/7/) | SUCCESS | 554s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/7/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/7/artifact/test-results/functional/wiremock/request-journal.json) |
| 7 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [8](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/8/) | SUCCESS | 506s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/8/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/8/artifact/test-results/functional/wiremock/request-journal.json) |
| 8 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [9](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/9/) | SUCCESS | 565s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/9/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/9/artifact/test-results/functional/wiremock/request-journal.json) |
| 9 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [10](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/10/) | SUCCESS | 748s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/10/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/10/artifact/test-results/functional/wiremock/request-journal.json) |
| 10 | `609ea2d48f4c82a6651ae0ff6911147bc93a4e88` | [11](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/11/) | SUCCESS | 484s | [Allure](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/11/allure/) | [Journal](https://build.hmcts.net/job/HMCTS_a_to_c/job/civil-citizen-ui/job/PR-8059/11/artifact/test-results/functional/wiremock/request-journal.json) |

## QA-person involvement and approval

This first migration batch requires a QA person. On the deployed preview, QA must complete the individual/no-interest/no-HWF create-claim journey once and compare it with the current full-stack behaviour. QA must check the page sequence, content, browser navigation, validation errors and final confirmation/reference, record screenshots or equivalent evidence, and add the approval reference to this matrix. QA must also confirm that payment, workflow completion, defendant assignment and both GA journeys remain owned by full-stack coverage and are not being claimed by WireMock. Product-owner approval is not required because no user-flow assertion is removed or materially changed; this batch changes only the technical execution layer.

DTSCCI-6132 additionally requires QA-person approval of the complete classification. The QA person must:

1. Reconcile the generated total with the executable suite and confirm all 174 active scenarios and 1227 material setup/assertion decisions are represented.
2. Sample every target category: setup-only, in-process integration, reduced-stack browser, contract/focused integration and retained thin full-stack.
3. Review each of the eight proposed thin full-stack exceptions and challenge every retained service-state assertion; confirm mocks/contracts cannot provide equivalent confidence.
4. Sample every domain migration batch and confirm deterministic assertions are assigned away from full-stack even when the source journey uses real-service setup.
5. Review the 166 `migrate-off-full-stack` rows and confirm each has an implementable batch/owner; require an explicit correction for any assertion whose generated target is not the actual lowest reliable layer.
6. Confirm the migration batches and ordering are usable by QA and engineering.
7. Record samples reviewed, findings, required corrections and approval on DTSCCI-6132 and the pull request.

CUI engineering must review the source-level ownership and migration batches. QA approval and engineering approval are required before DTSCCI-6132 can close. This change supplies the complete matrix and automated reconciliation control; it does not self-approve the classification.
