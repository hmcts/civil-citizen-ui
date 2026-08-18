# Reduced-stack WireMock contracts

## Ownership and scope

The mappings under `charts/civil-citizen-ui/wiremock` are the authoritative test doubles for the reduced-stack CUI create-claim PoC and first migration batch. They are deliberately consumer-owned because they are packaged into the CUI preview chart and exercise a CUI-only Jenkins journey. The central `civil-wiremock-mappings` repository remains authoritative for shared full-stack journeys; these reduced-stack assets must not be copied there unless ownership is explicitly transferred.

The inventory was derived from `CivilServiceClient`, the create-claim controllers and `src/test/functionalTests/tests/mocked/createClaim_tests.js`, then compared with the central CUI mappings. The central set has broad legacy rules and still maps total calculation at `/fees/claim/total-claim-amount`; it has no dashboard scenario-creation rule. The former local bundle also used broad claim, role and event regexes and returned an incomplete create-claim response inline.

## Endpoint inventory and gap analysis

| Scenario | CUI client / method | HTTP | Exact path template | Query | Significant headers | Request schema / example | Expected | Minimum response consumed | Fixture | Mapping | Owner | Pact |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Start draft | `CivilServiceClient.createDashboard` | POST | `/dashboard/scenarios/Scenario.AAA6.ClaimIssue.ClaimSubmit.Required/{redisKey}` | None | `Content-Type: application/json`; auth headers are supplied but not behaviour-selecting | `{"params":{}}` | 200 | No fields | `create-claim-dashboard-scenario.json` | `create-claim-dashboard.json` | CUI | Covered by client unit tests; provider Pact pending DTSCCI-5975 |
| Calculate total | `calculateClaimTotalAmount` | POST | `/fees/claim/total-amount` | None | `Content-Type: application/json` | `ClaimUpdate`, with numeric `totalClaimAmount` | 200 | JSON number | `create-claim-total-amount.json` | `create-claim-total-amount.json` | CUI | Covered by DTSCCI-5975 create-claim Pact |
| Claim fee | `getClaimFeeData` | GET | `/fees/claim/{amount}` | None | Civil Service auth | None | 200 | `calculatedAmountInPence`, `code`, `version` | `create-claim-claim-fee.json` | `create-claim-fees.json` | CUI | Covered by DTSCCI-5975 create-claim Pact |
| Hearing fee | `getHearingAmount` | GET | `/fees/hearing/{amount}` | None | Civil Service auth | None | 200 | `calculatedAmountInPence`, `code`, `version` | `create-claim-hearing-fee.json` | `create-claim-fees.json` | CUI | Not selected for provider Pact |
| Submit draft | `submitDraftClaim` / `submitEvent` | POST | `/cases/draft/citizen/{submitterId}/event` | None | `Content-Type: application/json`; Civil Service auth | `EventDto`; `event=CREATE_LIP_CLAIM` | 200 | `id`, `state`, `last_modified`, mandatory `case_data` used by conversion | `create-claim-submitted-claim.json` | `create-claim-submit.json` | CUI | Covered by DTSCCI-5975 create-claim Pact |
| Read submitted claim | `getClaimById` | GET | `/cases/1111222233334444` | None | Civil Service auth | None | 200 | Same representative case fields as submit | `create-claim-submitted-claim.json` | `create-claim-read.json` | CUI | Existing client coverage; provider Pact pending |
| Resolve case roles | `getUserCaseRoles` | GET | `/cases/1111222233334444/userCaseRoles` | None | Civil Service auth | None | 200 | Role string array | `create-claim-user-case-roles.json` | `create-claim-read.json` | CUI | Existing client coverage; provider Pact pending |
| Find address | Ordnance Survey postcode client | GET | `/search/places/v1/postcode` | `postcode=MK5 7HH` | API key is supplied but not behaviour-selecting | None | 200 | `results[].DPA` address fields | `create-claim-address-search.json` | `create-claim-address.json` | CUI | External API; no Civil Service Pact |

Before/after route corrections: dashboard changed from `/dashboard/scenarios/Scenario\\.AAA6\\.ClaimIssue\\.ClaimSubmit\\.Required/.*` to the fixed scenario plus one non-empty redis-key segment and an exact body; total calculation changed from central `/fees/claim/total-claim-amount` to the client contract `/fees/claim/total-amount` with a numeric `totalClaimAmount` match.

## Updating contracts

When a Civil Service contract changes, update the CUI client and its unit/Pact tests first, then update this inventory, mapping and minimal synthetic fixture in the same PR. Run `yarn wiremock:validate` and `yarn test:wiremock-contracts`. The validator rejects invalid JSON, missing fixtures, duplicate/conflicting rules, missing priorities and generic catch-alls. The contract test starts the complete set and proves every selected request matches while important invalid requests remain 404. Keep identifiers stable and synthetic; do not add production data or volatile request matching.
