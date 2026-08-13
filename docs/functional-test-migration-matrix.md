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

The explicitly agreed batch contains the one scenario above. The rest of `src/test/functionalTests/tests/ui_tests` remains full-stack pending scenario-level review. In particular, payment, assignment, workflow, general-application, hearings, case progression, query management and notification scenarios are not candidates for migration merely because WireMock can return canned data.

No scenario or assertion is removed by this batch. The full-stack individual journey remains scheduled because it owns the real payment, workflow, assignment and GA assertions. Its claim-creation steps are prerequisites for those assertions rather than duplicate coverage that can yet be deleted.

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
| Dependencies and known failure modes | Real IDAM login/draft setup for both paths; full-stack additionally waits on workflow, payment, assignment and GA. Record measured timings and observed failures from Jenkins. | Pending Jenkins evidence |
| Same-revision old/new comparison | Jenkins URLs, commit SHA, outcomes, durations and Allure links for both suites | Pending |
| Ten consecutive first-attempt reduced-stack runs | Ten rows in the run table below, all using one commit | Pending |
| WireMock request journal | Archived `test-results/functional/wiremock` link for each reduced-stack run; expected submission and lookup counts and zero unmatched requests | Pending |
| QA/product-owner approval | Approval reference for splitting browser claim creation from payment/workflow/assignment/GA | Pending |
| Duplicate PR execution removal | Follow-up change and coverage-owner review after all gates pass | Not started |

### Ten-run table

| Run | Commit | Jenkins build | First-attempt result | Duration | Allure | WireMock journal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | | | | | | |
| 7 | | | | | | |
| 8 | | | | | | |
| 9 | | | | | | |
| 10 | | | | | | |

## QA-person involvement

This first migration batch requires a QA person. On the deployed preview, QA must complete the individual/no-interest/no-HWF create-claim journey once and compare it with the current full-stack behaviour. QA must check the page sequence, content, browser navigation, validation errors and final confirmation/reference, record screenshots or equivalent evidence, and add the approval reference to this matrix. QA must also confirm that payment, workflow completion, defendant assignment and both GA journeys remain owned by full-stack coverage and are not being claimed by WireMock.
