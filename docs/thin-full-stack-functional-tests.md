# Thin full-stack functional-test suite

This is the operating specification for the `@thin-full-stack` suite introduced by
[DTSCCI-5974](https://tools.hmcts.net/jira/browse/DTSCCI-5974). It complements the wider nightly suite and the WireMock-backed reduced-stack PR suite.

## Selection and execution

Run locally or against an already configured environment with:

```bash
yarn test:thin-full-stack
```

In the standard CNP PR pipeline, add the `pr-values:thinFullStack` label to run this suite against that PR's existing full preview deployment. The label is mutually exclusive with `pr-values:reducedStack`. Removing it restores the current standard selection; DTSCCI-6134 will make reduced-stack the ordinary PR default while retaining this explicit full-stack route.

Thin-suite results live below `test-results/thin-full-stack`, have their own JUnit, Mochawesome and Allure output, and are published as **Thin Full-Stack Allure Report**. They are not combined with reduced-stack results.

## Trigger, gating and ownership policy

- Trigger: explicit `pr-values:thinFullStack` label on the standard CNP PR pipeline, providing an on-demand route for release investigation.
- Merge gating: the suite does not run on every PR and does not block merge.
- Release gating: a first-attempt application failure blocks promotion until triaged; a confirmed environment-only failure does not block promotion when the incident and a successful rerun are linked.
- Primary triage owner: Mike Lemos (DTSCCI-5974 assignee).
- Backup triage owner: must be named by the delivery lead before approval; an unnamed team is deliberately not treated as ownership.
- Application failures go to the owning service engineer, assertion/setup defects to CUI engineering, and platform or shared-environment failures to the relevant environment support owner. The primary owner retains coordination until classification is recorded.

Codecept step retries are disabled for this selector. Jenkins must not automatically turn a failed first attempt green. An infrastructure rerun is a separate Jenkins build: link both builds, retain the first report, and record `first-attempt result`, `rerun result`, duration and failure category independently.

## Retained scenarios

All waits use the bounded business-process or case-state polling in the API helpers, or Codecept's bounded DOM polling. Fixed sleeps have been removed from the selected scenarios.

| Risk / selected scenario | Services and initial data | Action and expected cross-service state | Maximum wait, cleanup and owner | Why mocks/contracts are insufficient |
| --- | --- | --- | --- | --- |
| Claim issue, fee payment, workflow, assignment and GA — `IndividualvsIndividual_tests.js` | CUI, Civil Service, CCD, Camunda, Pay, IDAM, role assignment and GA; new claimant/defendant and draft individual claim | Submit and pay claim, await completed process, assign defendant, create claimant and defendant GAs; paid claim, access and both GA records must be observable | API helper timeout 120s per process; global teardown removes users/roles; CUI/Civil/GA owners by failing boundary | Requires real payment, orchestration, role assignment and two persisted GA workflows |
| Defendant linking — `defendantLinkingThroughCUI_tests.js` | CUI, Civil Service, CCD, IDAM and role assignment; new claim and two users | Link using claim number/security code and complete defendant response; linked access and response state must persist | API/DOM bounded waits up to 120s/90s; global teardown; CUI/role-assignment owner | A mock cannot prove case-user/role wiring or access in CCD |
| GA progression — `LiPvLiP_GA_DismissAnOrder_tests.js` | CUI, Civil Service, CCD, Camunda and GA; assigned fast-track LiP claim | Create GA, make dismiss-order decision and await case process; order notification must appear | Case-specific process timeout 120s; global teardown; GA owner | Requires separate GA case creation, judicial event and notification propagation |
| Bundle persistence — `cp_LiPvLiP_bundles_small_claims_tests.js` | CUI, CCD, Civil Service and document/bundle services; progressed small claim with evidence | Generate bundle and await process; both parties must see persisted bundle metadata/content | Process/DOM waits 120s/90s; global teardown; case-progression/document owner | Contracts cannot prove generated document persistence and party visibility |
| Hearing-fee payment — `cp_LiPvLiP_hearing_fee_tests_fast_track_tests.js` “Pay” scenario | CUI, Civil Service, CCD, Camunda and Pay; fast-track claim at hearing-fee stage | Pay fee and await workflow; paid notification/task state and email must be observable | Process/DOM waits 120s/90s; global teardown; hearing/payment owner | Requires provider payment plus downstream CCD, task and notification state |
| Query Management follow-up — `qm_Hearing_LiPvLiP_followUp_tests.js` | CUI, Civil Service, CCD and Work Allocation/QM; issued claim and claimant/defendant queries | Raise, respond, follow up and close; parties must see follow-up and closed state | Event/DOM waits 120s/90s; global teardown; QM/WA owner | Requires real query routing, permissions and persisted conversation state |
| Notice of Change — `LipVLR_NoC_e2e_tests.js` “DefenceAll” scenario | CUI, Civil Service, CCD, Camunda, IDAM and role assignment; paid/assigned LiP claim and solicitor | Apply NoC and submit LR defence; citizen loses access, solicitor gains access and case reaches `AWAITING_APPLICANT_INTENTION` | Event/state waits 120s; global teardown; NoC/role-assignment owner | Only the real case-role and CCD event chain proves access replacement and state |
| Scheduled strike-out — `cp_LiPvLiP_case_struck_out_fast_track_tests.js` | CUI, Civil Service, CCD and Camunda/scheduler; fast-track claim with unpaid hearing fee | Trigger unpaid-fee processing and await workflow; both parties see strike-out and inactive tasks | Process/DOM waits 120s/90s; global teardown; case-progression owner | Requires asynchronous state transition and resulting notifications/task availability |

Page/routing combinations remain owned by route, integration and reduced-stack tests as recorded in `functional-test-migration-matrix.md`; they are not a reason to retain these scenarios.

## Evidence and approval

Before closure, record ten consecutive scheduled/on-demand builds on one approved revision. For each build record commit, Jenkins URL, first-attempt outcome, duration, Allure URL and failure category. Attach one successful report and one deliberately diagnosed bounded-timeout report. Do not substitute the existing reduced-stack ten-run table.

This ticket requires work by a QA person. QA must:

1. Review all eight rows against the stated business risk and confirm no retained assertion is already adequately owned by reduced-stack/integration coverage.
2. Run one successful journey for every distinct category above against the full preview, checking the expected persisted state and recording Jenkins/Allure links and screenshots or equivalent evidence.
3. Review a deliberately diagnosed timeout, confirm the original failure remains visible, and verify any rerun is reported separately.
4. Approve the scenario list, trigger/gating policy, named primary and backup owners, expected runtime and ten-run evidence on the PR/Jira ticket.

CUI engineering and the delivery lead must also approve the scenario list and policy. The ten-run ledger and named backup are intentionally not fabricated in source control; add the approved evidence links here before closing the ticket.
