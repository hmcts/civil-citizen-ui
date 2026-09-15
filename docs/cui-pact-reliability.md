# CUI Pact reliability

The consumer suite calls the existing clients. Run `yarn test:pact` (one worker),
then `yarn pact:validate`. Jest cleans the generated directory once before the
consumer suites; it does not clean between suites sharing the Civil Service file.
Multiple workers are rejected because these suites share an output file.

`yarn test:pact:run-and-publish` is the existing CI entry point. It now runs the
tooling regressions, generates the Pacts, validates the exact artifact inventory,
and publishes only after success. `pact:publish` also validates independently.
Do not publish the output of a filtered consumer run: it is incomplete and fails
validation. Jenkins already enables consumer Pact execution on PR and master.

The publisher supplies `consumerVersion`, `branch` and the existing branch tag.
Version comes from `PACT_CONSUMER_VERSION` or the full checked-out commit. Branch
comes from `PACT_BRANCH_NAME`, `CHANGE_BRANCH`, `BRANCH_NAME`, then Git; detached
HEAD requires an explicit branch. Set `PACT_BRANCH_NAME` to the source branch in
CI. The Civil Service selectors use matching branch, main branch and deployed or
released versions. The Broker's CUI main branch must be configured as `master`;
tags alone do not establish that setting. Confirm selection in the live provider
job before recording completion. No Can-I-Deploy gate is added (DTSCCI-824).

## Current interaction map

The machine-checked [inventory](../src/test/contract/interaction-inventory.json)
lists every interaction description and provider state. It must change with any
new or removed consumer interaction. The current union is six Civil Service,
one IDAM and one S2S interaction in three artifacts.

| Consumer file / client method | HTTP boundary | State reference in inventory | Follow-up |
|---|---|---|---|
| CivilServiceCreateClaim / getClaimFeeData | GET /fees/claim/1000 | A claim issue fee is available… | DTSCCI-6420 |
| CivilServiceCreateClaim / submitEvent | POST /cases/1111222233334444/citizen/cui-user-id/event | Draft case 1111222233334444… | DTSCCI-6413: real draft route and translated data remain uncovered |
| CivilServiceFeePayment / getFeePaymentRedirectInformation | POST /fees/CLAIMISSUED/case/{id}/payment | Claim issue payment can be initiated for case… | DTSCCI-6432 |
| CivilServiceFeePayment / getFeePaymentStatus | GET /fees/CLAIMISSUED/case/{id}/payment/{reference}/status | Payment status SUCCESS is available for payment… | DTSCCI-6432 |
| CivilServiceFeePayment / getGaFeePaymentRedirectInformation | POST /fees/case/{id}/ga/payment | Claim issue payment can be initiated for general application case… | DTSCCI-6432 |
| CivilServiceFeePayment / getGaFeePaymentStatus | GET /fees/case/{id}/ga/payment/{reference}/status | Payment status SUCCESS is available for general application payment… | DTSCCI-6432 |
| Oidc / getOidcResponse | POST /o/token | a token is requested | DTSCCI-6449 |
| ServiceAuthProvider / generateServiceToken | POST /lease | microservice with valid credentials | Existing coverage |

The Broker verifier `CivilCitizenUiProviderContractTest` uses the provider states
and setup in Civil Service's `CivilCitizenUiProviderSupport`. The target applies production
`JacksonConfiguration` and controller advice, with JSON and string converters.
It does not rewrite responses or tolerate an absent Pact. Runtime regression
checks also exercise this setup through the existing provider test task.

## Reproduce provider evidence

Apply the accompanying Civil Service changes and publish the CUI Pact through
the consumer pipeline. Run the supported Civil Service provider workflow with
the matching provider branch. For a focused Broker-backed check:

```sh
PACT_BROKER_FULL_URL=https://pact-broker.platform.hmcts.net ./gradlew providerContractTests --tests uk.gov.hmcts.reform.civil.provider.CivilCitizenUiProviderContractTest -Ppact.provider.branch=YOUR_BRANCH
```

Inspect `build/reports/tests/providerContractTests` and its JUnit XML for the
selected consumer versions and interaction counts. This command does not publish
verification results; retain the supported provider pipeline's published result
as completion evidence. Selectors may also include older main-branch contracts.

Initial local runtime verification exposed two failures: production Jackson
returned `2023-11-27T13:15:06.313Z`, while the old consumer expected decimal epoch
seconds. Four other interactions and four runtime regressions passed. The two
payment-creation expectations now match that observed ISO response. No production
application code changed.

## Completion evidence still required

Local checks on 14 September 2026 passed: eight consumer tests, eleven tooling
regressions, six generated-file provider interactions and four runtime regressions.
All three controlled provider variants failed as expected. Default one-worker
generation removed a deliberately seeded stale interaction and extra artifact,
then validated the exact three-file inventory. Focused ESLint and provider
Checkstyle passed.

The Broker was reachable outside the sandbox, and a read of the
`civil_citizen_ui` participant confirmed `mainBranch: master`. This read is not
publication or verification evidence. No uncommitted version was published.

Retain the supported Jenkins run, published consumer version/branch and Pact URL,
Broker-selected CUI interaction count, and published provider verification result.
Local generated-file verification and mocked publisher transport regressions do
not prove Broker publication or selection. The other epic work packages remain
open; this change adds no new endpoint coverage.
