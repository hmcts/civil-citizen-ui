# Complete pre-epic functional baseline

The authoritative snapshot is `72ae40ba85c98e0d99376211643be6ea9140df88`, the parent of DTSCCI-5964 (`460c1ae6a6`), which first changed preview selection for the reduced stack. `functional-baseline.json` records the scenario identities, routing tags and existing skip states loaded through Codecept/Mocha at that revision.

| Default selection | Selected | Active | Existing skips |
| --- | ---: | ---: | ---: |
| PR | 19 | 14 | 5 |
| Master | 17 | 12 | 5 |

The two hearing-fee journeys are PR-only. The five existing skips are the three case-offline scenarios, the fast-track order dashboard scenario and the fast-track evidence/trial-arrangements scenario. Their declarations remain unchanged. Grep-excluded siblings in reports are not selected scenarios.

The defendant-linking feature was added to PR selection during the epic, after this snapshot. It remains available on demand using `@ui-defendant-linking`, with its scenario bodies and existing skip unchanged. Removing its PR routing tag restores the original selection rather than increasing the baseline with new coverage.

## Final boundary inventory

All fourteen active PR identities now carry `@thin-full-stack`; none remains awaiting migration. Standard execution retains its existing worker configuration. Optimised execution selects exactly the same default tag in one worker, including the five declared skips. Nightly and on-demand scenarios are not added to either default selection.

The optimised chart replaces Fees, Payments, Docmosis and CDAM endpoints with WireMock. Citizen UI address lookup and the browser payment endpoint also use WireMock. XUI, EM stitching, EM CCD orchestration and the deployed CDAM component are disabled. Citizen UI, Civil Service, CCD, Camunda, IDAM, access/role assignment and their required data stores remain real. Notification checks retain the existing Civil Service notification-audit boundary.

| Active journey | Why the retained real boundary is required |
| --- | --- |
| Case struck out | Unpaid hearing-fee processing produces the genuine case state. |
| Individual claim and general applications | Persisted claim and application workflows determine access and dashboard state. |
| Default judgment / certificate of satisfaction | Judgment events and subsequent case state remain real. |
| Full admission, immediate payment | Persisted defendant response determines dashboard state. |
| Full admission, set-date payment / CCJ | Repayment and judgment events determine case state. |
| Dismiss an order | Persisted general-application decision and notification audit are checked. |
| Fast-track hearing payment | Payment callbacks produce real task completion and notification audit. |
| Small-claims hearing payment | Payment callbacks produce real CCD state and task completion. |
| Unsuccessful mediation | Mediation processing produces notifications and document availability. |
| Notice of change | Real role/access replacement and defence state are checked. |
| Partial admission, immediate payment | Persisted defendant response determines dashboard state. |
| Query follow-up | Real conversation access, follow-up and query closure are checked. |
| Reject all / claimant intention | Real claimant-intention processing determines case state. |
| Welsh documents | Real claimant-intention and translated-document events move the dashboard from processing documents to awaiting mediation. |

The Welsh scenario, helpers and assertions are unchanged; only its migration tag is added. Its document upload uses Civil Service testing support and the existing CDAM mappings. Mock rendering/storage do not verify translated PDF contents or external provider behaviour.

## Enforced reconciliation and paired verification

`yarn test:functional-baseline` compares current PR/master identities and skip states with the historical manifest, rejects duplicates and checks that every active baseline scenario is migrated. Identity includes the file and complete feature/scenario title, excluding routing tags.

Default optimised runs and full standard runs perform this check before execution. After execution, the runner reconciles Mochawesome outcomes with the manifest and archives `test-results/functional/baseline-results.json`. Missing, duplicate, failed, newly skipped or unexpectedly executed scenarios fail reconciliation. Existing disabled scenarios must remain skipped.

For paired PR verification, use `runAllFunctionalTests` in both modes, with no custom functional groups; add `pr-values:optimisedTests` only for the optimised run. Download each run's `baseline-results.json` and compare:

```sh
node bin/functional-baseline.js compare standard-baseline-results.json optimised-baseline-results.json
```

This requires the same source revision, opposite modes and identical successful identity/outcome lists. Jenkins also retains stage durations and optimised WireMock diagnostics; unmatched requests must be investigated rather than hidden with broad fallback mappings.

This ticket does not require QA-person involvement. Developer review, automated reconciliation and paired Jenkins verification cover the unchanged journeys and their infrastructure migration.
