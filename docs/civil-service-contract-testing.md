# CUI–Civil Service contract testing

## Initial endpoint ranking

The initial scope was selected from `charts/civil-citizen-ui/wiremock/mappings/cui-create-claim.json`.

| Rank | Endpoint | Why drift matters | Pact interaction |
|---|---|---|---|
| 1 | `POST /cases/{caseId}/citizen/{userId}/event` | Submits the claim; request or case identity drift blocks claim creation. | `a request to submit a create-claim event` |
| 2 | `GET /fees/claim/{amount}` | Incorrect fee fields display the wrong business information. | `a request for the claim issue fee` |

The status-only dashboard scenario stub is deliberately excluded. The Ordnance Survey interaction has a different
provider owner and is not a CUI–Civil Service contract. Case retrieval and role lookup are the next migration batch;
they are excluded from this initial scope until their provider states use representative migrated case data.
`POST /fees/claim/total-amount` is excluded until Civil Service exposes an equivalent provider endpoint.

## Ownership and change workflow

Civil Citizen UI owns consumer expectations and its Jenkins publication. Civil Service owns provider states,
verification and compatibility checks. Failed verification is triaged jointly in `#civil-citizen-ui` with the CUI
maintainers owning unintended consumer over-constraint and Civil Service maintainers owning provider regressions.

Additive provider changes may be deployed when verification stays green. A breaking change starts with a new/additive
provider shape, followed by a CUI consumer release and only then removal of the old behaviour. The Civil Service Pact
verification stage is required on PR and master by `enablePactAs(PROVIDER)`; CUI publishes branch and master contracts
through the corresponding Jenkins consumer stage.

## WireMock relationship

Pact examples use the same stable case, fee and role values as `cui-create-claim.json`, but expectations contain only
fields CUI consumes. WireMock remains available without the broker and protects journey orchestration; Pact verifies
the real controller contract. Changes to a ranked fixture must update its cross-referenced Pact interaction in the
same PR. Run `yarn test:pact` locally to generate the contract before changing a ranked fixture.

The controlled incompatibility check changed `calculatedAmountInPence` from Civil Service's JSON string to a number;
provider verification failed with a type mismatch. The WireMock fixture now uses the verified string representation.

Technical sign-off is required from one CUI maintainer and one Civil Service maintainer before merge.
