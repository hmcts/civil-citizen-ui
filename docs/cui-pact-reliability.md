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
new or removed consumer interaction. The current union is twelve Civil Service,
one IDAM and one S2S interaction in three artifacts.

| Consumer file / client method | HTTP boundary | State reference in inventory | Follow-up |
|---|---|---|---|
| CivilServiceCreateClaim / getClaimFeeData | GET /fees/claim/1000 | A claim issue fee is available… | DTSCCI-6420 |
| CivilServiceCreateClaim / submitDraftClaim | POST /cases/draft/citizen/cui-user-id/event | A draft {variant} claim can be submitted | Four translated party pairings; DTSCCI-6413 |
| CivilServiceCreateClaim / submitEvent | POST /cases/1111222233334444/citizen/cui-user-id/event | Citizen event submission returns {error variant} | Three 422 envelopes; DTSCCI-6413 |
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

## Draft submission and validation errors

The draft contracts replace the skeletal numeric-case submission with four calls
through `translateDraftClaimToCCDR2` and `submitDraftClaim`: individual/company,
company/organisation, organisation/sole trader and sole trader/individual. Together
these exercise every party type on both sides and English, Welsh and bilingual
language preferences without repeating every browser journey.

`fixtures/draftClaimRequest.json` contains fixed, reviewed wire examples. Required
party names, addresses, amount in pounds, breakdown in pence, interest enums and
start date, fee strings, language and statement-of-truth fields are matched in
the actual HTTP request. Update the corresponding Civil Service resource
`civil-cui-draft-claims.json` alongside intentional contract changes. Provider
states match the complete event submission parameters, use real Party models and
return a populated CaseDetails response with id, state and last_modified. Consumer
assertions cover converted identity, party names/types/addresses, amount, fee and
language. The legacy numeric-case provider state remains while older Pacts select it.

Three citizen-event rejection contracts cover callbackErrors/callbackWarnings,
details.field_errors[].message and a valid 422 without actionable fields. The
provider service throws a downstream Feign 422; the real RequestFilter and
ResourceExceptionHandler produce the HTTP response. The consumer must raise
CallbackError with actionable messages/warnings for the first two and preserve
the Axios error for the third.

The active DTSCCI-6156 PR (#8218, reviewed on 16 September 2026) changes functional
execution and submission plumbing but adds no consumer Pact interactions. This
package owns these interactions and provider states; existing functional journeys
remain intact. No production application files are changed.

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

Draft/error checks on 16 September 2026 passed: fourteen consumer tests across
four suites, eleven tooling regressions, twelve generated-file Civil Service
interactions (none skipped), and four runtime regressions. Artifact validation,
focused ESLint and provider Checkstyle passed. Controlled contracts requiring a
numeric last_modified or a renamed fieldErrors envelope were rejected by the
provider verifier. These runs used temporary verification helpers outside the
repositories; no local-only verifier or Gradle task is part of the change.
Publication and Broker-backed pipeline verification of this expanded contract
remain outstanding. Record the published version, Pact URL and provider result
after running the supported workflows; the earlier six-interaction result does
not verify these new interactions.

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
open; publication and provider results must be recorded for each new contract version.
