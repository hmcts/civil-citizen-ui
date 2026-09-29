# Functional tests

## Running tests

Configure the environment URLs and credentials as described in the [README](../README.md).

| Run | Command or PR label |
| --- | --- |
| Standard PR / master baseline | `yarn test:civil-citizen-pr` / `yarn test:civil-citizen-master` |
| Default PR preview | Optimised deployment; no label required |
| Standard preview comparison | Add `pr-values:standardTests`; remove it to restore the default |
| Full baseline verification | Add `runAllFunctionalTests`, with no `pr_ft_*` group labels; remove it after verification |
| Selected functional group | Use the existing `pr_ft_ui-*` / `pr_ft_api-*` labels listed in the README |
| Nightly suite | `yarn test:civil-citizen-nightly` |
| Local mocked create-claim journey | `yarn test:mocked-functional` (requires Java and `yarn playwright install chromium`) |

The local mocked runner starts CUI, WireMock and in-memory session/draft stores. Logs go to `${TMPDIR:-/tmp}/civil-citizen-ui-mocked-functional`. It is separate from the optimised preview baseline.

## Optimised preview

Both modes run the same baseline journeys and assertions. Optimised execution loads only baseline files and gives each file its own worker: 18 for PRs and 16 for master, compared with 13 standard workers. PR previews use optimised execution by default. `pr-values:standardTests` restores the previous standard deployment and complete baseline selection; it does not enable extra Work Allocation or messaging services. Both modes run the complete baseline again on reruns. Master and nightly deployment remain unchanged.

| Real boundaries | Mocked boundaries |
| --- | --- |
| CUI, Redis, Civil Service, CCD, Camunda, identity/authentication, access/role assignment and required data stores | Fees, Payments/GovPay, Docmosis, CDAM and CUI address lookup |

Real services supply persisted case/workflow state, notifications and access changes. Mock payments and documents do not prove provider settlement, PDF content or inbox delivery. Shared reference services and the Civil Service notification audit remain in use. XUI, the CCD browser gateway, EM stitching, EM CCD orchestration and deployed CDAM are disabled in the default preview. `pr-values:fullDeployment` also restores standard dependencies and enables its additional Work Allocation, messaging and hearing integrations. Use the standard deployment for groups outside the migrated baseline.

## Baseline and coverage checks

[functional-baseline.json](functional-baseline.json) records the pre-migration source revision, exact scenario identities and existing skips. PR selects 19 scenarios (14 active, five skips); master selects 17 (12 active, five skips). Nightly/on-demand coverage, including bundles and defendant linking, is outside this baseline.

```sh
yarn test:functional-baseline
```

The baseline check reads the complete source inventory before worker filtering. Default and standard comparison runs reconcile results against it and fail for missing, duplicate, failed, newly skipped or unexpectedly executed journeys. Compare the archived results from opposite modes on the same revision with:

```sh
node bin/functional-baseline.js compare standard-baseline-results.json optimised-baseline-results.json
```

Use [test-pyramid.md](test-pyramid.md) for unit and integration ownership. Keep migration plans, approval records and run-by-run evidence in Jira/PRs.

## Maintaining mocks and contracts

Preview mappings and synthetic fixtures live in [charts/civil-citizen-ui/wiremock](../charts/civil-citizen-ui/wiremock). Update the production client tests, mappings and fixtures together when a boundary changes. Run:

```sh
yarn wiremock:validate
yarn test:wiremock-contracts
yarn test:pact
```

Mapping validation rejects missing fixtures, conflicting rules and generic catch-alls. Contract checks exercise valid and invalid requests against the complete mapping set. The [Pact interaction inventory](../src/test/contract/interaction-inventory.json) lists covered interactions and provider states; consumer tests live in [src/test/contract/consumers](../src/test/contract/consumers). Provider verification remains necessary: a mocked browser response alone does not prove compatibility.

WireMock and its state extension are pinned by the preview bootstrap. Keep one mock instance: payment state is keyed by unique payment reference, so parallel journeys must never reset global state. Payment contract checks interleave twice as many payments as PR workers and verify independent completion. Do not hide unmatched requests with fallback mappings.

## Investigating failures

Start with `test-results/functional/functional-failure-summary.json`, then follow its artifact links to screenshots, traces, Mochawesome and Allure results. Failure classification is advisory; the original test failure remains authoritative even if report publication also fails.

Optimised runs archive sanitised unmatched requests, near misses and request journals under `test-results/functional/wiremock/`. Any unmatched request fails verification, even if the browser passed. Raw logs may contain credentials or personal data; use the sanitised artifacts when sharing evidence.
