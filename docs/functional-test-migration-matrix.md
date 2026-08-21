# Functional test migration matrix

This document records the agreed migration boundary for deterministic CUI browser journeys. It is the coverage ownership record for DTSCCI-5973; it must be updated when another scenario enters the batch or an assertion changes layer.

## Suite selection

| Suite | Selector | Command | Purpose |
| --- | --- | --- | --- |
| Reduced-stack browser | `@reduced-stack` | `yarn test:mocked-functional:browser` | Browser, session and multi-page CUI behaviour against deterministic WireMock responses |
| Reduced-stack create claim | `@reduced-stack-create-claim` | `npx codeceptjs run --grep '@reduced-stack-create-claim' --reporter mocha-multi --verbose` | The independently selectable first migration batch |
| Full-stack PR | `@civil-citizen-pr` | `yarn test:civil-citizen-pr` | Behaviour that depends on real service transitions or wiring |
| Full-stack nightly | `@civil-citizen-nightly` | `yarn test:civil-citizen-nightly` | Wider real-service regression coverage |

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

The authoritative scenario-level inventory is [functional-test-scenario-classification.csv](functional-test-scenario-classification.csv). It is generated from the executable Codecept declarations rather than maintained as an independent list:

```bash
yarn test:generate:functional-classification
yarn test:functional-classification
```

The check runs in `cichecks` and fails when an active scenario is added, removed or renamed without regenerating and reviewing the classification. The inventory includes file, feature, scenario, active pipeline tags, material helper/assertion steps, primary target layer, coverage owner, real-service boundary, rationale, delivery batch and proposed execution decision.

At classification time the executable suite contained:

| Measure | Count | Percentage of active |
| --- | ---: | ---: |
| Declared scenarios | 198 | — |
| Skipped declarations | 23 | — |
| Active scenarios classified | 175 | 100% |
| Full-stack primary target | 166 | 94.9% |
| Reduced-stack browser primary target | 3 | 1.7% |
| In-process integration primary target | 6 | 3.4% |

No active scenario is left as `TBC`, `pending review` or without an owner. `Pact` remains an assertion-level replacement for important CUI/Civil Service request/response contracts rather than the primary execution layer for an existing browser scenario. The create-claim submission contract is owned by `src/test/contract/consumers/CivilServiceCreateClaim.test.ts`; the browser coverage owns navigation/session behaviour or genuine cross-service state, not provider-contract correctness.

### Proposed execution split

Primary target and execution frequency are separate decisions. A scenario may genuinely require real services without belonging in the small independently triggered full-stack smoke suite.

| Proposed execution decision | Scenarios | Purpose |
| --- | ---: | --- |
| Proposed thin full-stack | 8 | Representative cross-service categories used for release investigation and the trigger/gating policy delivered by DTSCCI-5974 |
| Nightly/on-demand full-stack | 158 | Wider genuine state-transition regression retained outside ordinary PR feedback |
| Migrate off full-stack | 9 | Deterministic browser or CUI-only controller/session assertions delivered through DTSCCI-6133 batches |

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

The proposal selects one active scenario from each representative source, producing eight scenarios across eight distinct cross-service risk categories. DTSCCI-5974 owns final approval of this scenario list, trigger, gating and triage policy; this matrix provides the evidence-based candidate rather than claiming that approval has already occurred.

### Migration batches and ordering

| Order | Delivery | Scope | Dependency |
| ---: | --- | --- | --- |
| 1 | DTSCCI-6133: CUI-only guards | Move the six payment confirmation authentication/redirect scenarios to route or integration tests | None beyond the reviewed classification |
| 2 | DTSCCI-6133: split compound claim variants | Move deterministic company/organisation/sole-trader form and navigation assertions to the reduced stack and keep only justified payment/workflow/assignment/GA assertions in real-service coverage, reusing the validated WireMock and Pact foundation | DTSCCI-5972 and DTSCCI-5975 are complete |
| 3 | DTSCCI-6133: negative response UI | Move deterministic defendant-response validation scenarios to reduced-stack browser coverage | Add only scenario-driven mappings and contract protection |
| 4 | DTSCCI-5974: thin full-stack | Finalise the eight-scenario candidate, split redundant page assertions, implement independent trigger/reporting and collect ten-run evidence | CUI engineering, QA and delivery-lead approval of policy/owners |
| 5 | DTSCCI-6134: default PR cutover | Make the approved reduced-stack suite the default ordinary-PR route | DTSCCI-6132, DTSCCI-6133, DTSCCI-5974 and DTSCCI-5977 |

The 158 wider full-stack scenarios are classified as nightly/on-demand because their primary business assertions involve genuine workflow, state, assignment, payment or document behaviour. They are not automatically permanent: each DTSCCI-6133 batch must split deterministic UI assertions where replacement coverage provides equivalent confidence, and update the CSV decision in the same change.

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

1. Reconcile the generated total with the executable suite and confirm all 175 active scenarios are represented.
2. Sample every primary target category: in-process integration, reduced-stack browser and full-stack.
3. Review each of the eight proposed thin full-stack scenarios and confirm they collectively cover the stated payment, CCD/Camunda, assignment, GA, document, hearing, WA/Query Management, NoC and scheduler/state risks.
4. Challenge at least one `nightly/on-demand-full-stack` decision in each domain group and confirm mocks/contracts cannot provide equivalent confidence for its primary assertion.
5. Review the nine `migrate-off-full-stack` rows and the secondary targets on compound create-claim rows; confirm the named replacement layer preserves each material assertion before implementation removes any full-stack execution.
6. Confirm the migration batches and ordering are usable by QA and engineering.
7. Record samples reviewed, findings, required corrections and approval on DTSCCI-6132 and the pull request.

CUI engineering must review the source-level ownership and migration batches. QA approval and engineering approval are required before DTSCCI-6132 can close. This change supplies the complete matrix and automated reconciliation control; it does not self-approve the classification.
