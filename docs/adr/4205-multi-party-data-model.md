# ADR: defendant context and draft isolation for 1v2 citizen claims

- Ticket: [DTSCCI-4205](https://hmcts.atlassian.net/browse/DTSCCI-4205)
- Status: Proposed, pending team and backend/CCD review
- Date: 30 October 2026
- Scope: one claimant and up to two defendants in Civil CUI
- Delivery: design only. Approval does not enable a new journey.

## Context and verified baseline

CUI represents the responding party through `Claim.respondent1` and top-level response state. `Claim.fromCCDCaseData` and `services/translation/convertToCUI/cuiTranslation.ts` translate the existing case into this model. `common/models/civilClaimResponse.ts` and `common/models/ccdResponse/ccdResponse.ts` are the read and response-write contracts. The latter has 58 top-level properties; the accompanying [field inventory](4205-ccd-field-inventory.md) records every one against the Civil CCD CaseField definitions.

Civil Service already has `respondent2`, response types, deadlines, dates, representation and DQ fields in `model/CaseData.java` and `CaseDataParent.java`. CCD exposes corresponding numbered fields, but names and nested types are not uniformly symmetric. Legal-representative support does not establish citizen support. In particular, a `respondent2LiPResponse` or second PIN contract must not be invented by changing a digit in a property name.

Current routes use `/case/:id/response/...` (`routes/urls.ts`). First-contact claim summary checks `respondent1PinToPostLRspec.accessCode`. Civil Service's `controllers/cases/CaseAssignmentController.java` validates the PIN for the `DEFENDANT` case role, and `enums/CaseRole.java` exposes a single citizen defendant role. Neither a case role nor knowledge of a URL establishes which defendant a citizen may act for.

`modules/draft-store/draftStoreService.ts` stores a claim-shaped draft; `generateRedisKey` concatenates route case ID and user ID. It has no defendant dimension. CUI submits `DEFENDANT_RESPONSE_CUI` through `CivilServiceClient.submitDefendantResponseEvent`. Both the outbound translator and the backend event handling need explicit party ownership before respondent 2 can submit safely.

Current overlapping work: [6622 / PR 8386](https://github.com/hmcts/civil-citizen-ui/pull/8386) migrates defendant-response drafts; [5154](https://hmcts.atlassian.net/browse/DTSCCI-5154) preserves existing Redis key bytes; [5155](https://hmcts.atlassian.net/browse/DTSCCI-5155) owns upload recovery; [5156](https://hmcts.atlassian.net/browse/DTSCCI-5156) owns session-save failure handling; [5158](https://hmcts.atlassian.net/browse/DTSCCI-5158) owns bounded upload resources. This ADR defines required identity and isolation at the repository boundary without replacing those deliveries or prescribing Redis as the durable store.

## Decision 1: a party collection inside CUI, numbered fields at the boundary

Introduce a typed case projection with `claimant` and `defendants`, retaining backend respondent slots as stable IDs. Use `respondent1` and `respondent2` as opaque, validated slot identifiers, not mutable array offsets. Sorting or filtering the collection must never change identity. One shared party/response component should operate on a selected context, rather than copying the whole respondent-1 journey.

Illustrative types below are proposed CUI types, not deployed API definitions:

```typescript
type DefendantId = 'respondent1' | 'respondent2';
interface DefendantContext {
  caseId: string;
  defendantId: DefendantId;
  actorUserId: string;
  caseVersion: string;
}
interface DefendantProjection {
  id: DefendantId;
  party: Party;
  responseDeadline?: string;
  submittedAt?: string;
  response?: DefendantResponse;
  capabilities: DefendantCapabilities;
}
```

`DefendantResponse` groups response choice, admission/defence, payment proposal, means, timeline, evidence, DQ, mediation and language preference. These types must be defined from the agreed wire contracts, not cast from `Claim`. Capabilities come from authorised case context, not form fields. Case totals, claimant details and common hearing information remain case-level. A missing second defendant means a 1v1 case; it must not create a blank respondent-2 draft. An unavailable or unauthorised context is an error, never a fallback to defendant 1.

Read adapters map each supported CCD slot into the collection. Write adapters accept a selected context and emit an explicit allowlist of changes for that slot. Never serialize the entire case projection back to CCD or dynamically rename all `respondent1` properties. Preserve unrelated and unknown CCD fields through the backend's update mechanism, rather than round-tripping them through CUI.

The field inventory is the baseline for agreeing mappings. Shared-looking fields such as `respondToAdmittedClaim`, `specResponseTimelineOfEvents`, `specResponselistYourEvidenceList`, `responseClaimMediationSpecRequired` and payment/means fields are particularly important: they need an explicit party ownership decision. Existing schema candidates do not prove that callbacks, generated documents or permissions support the intended usage. Nested `CCDRespondentLiPResponse`, financial details and DQ types need the same leaf-level review when their backend contract is agreed. No respondent-2 payload is approved by this ADR.

Rejected: duplicating `respondent2` and all response logic throughout CUI increases divergent behaviour. Replacing CCD's numbered schema with a party array would require unrelated backend migration. A CUI collection plus explicit adapters limits both risks.

## Decision 2: request-scoped, authorised defendant context

Canonical proposed route: `/case/:id/response/:defendantId/<step>`, for example `/case/123/response/respondent2/task-list`. Route validation accepts exactly the two slot IDs, then checks case membership and the authenticated actor's permitted slots on every read and mutation. Extend redirects, forms, back links, document endpoints and language toggles through one route builder. Reject unknown slots and tampered case/party combinations before reading drafts or documents.

Existing `/case/:id/response/<step>` bookmarks remain usable for 1v1 by resolving the sole authorised defendant and redirecting GET requests to the canonical route. Never silently replay an old POST into a different context. Re-render or request resubmission with CSRF protection after resolving an unambiguous authorised context. With multiple authorised slots, show an approved selection page; with no slot, deny access. Do not store a globally selected defendant in the browser session: two tabs must keep independent contexts.

Backend contract required: return the actor's authorised defendant slot(s) and enforce the same ownership during submission and document access. First-contact linking must bind a challenge and successful link to one case and defendant; knowledge of defendant 1's PIN must not grant defendant 2 access. Service owners must agree invitation/PIN fields, role assignment and lifecycle, including representation changes and revoked access. CUI must not use the existing broad `DEFENDANT` role as a substitute for that binding.

Separate response submission is the default proposal. Acting for both defendants, joint responses, conflicting answers, mixed represented/unrepresented cases and claimant action before both responses arrive require BA/backend approval. They are not inferred from `respondentResponseIsSame` or shared legal representation.

## Decision 3: separate versioned drafts per case, defendant and actor

Use a logical draft identity `(journey=response, caseId, defendantId, actorUserId, schemaVersion)`, accessed only through an authorised context. A possible Redis encoding is `cui:response:v2:<caseId>:<defendantId>:<actorUserId>` with strictly validated components; it is illustrative and does not change the 5154 key contract. The same identity must map to CMC ownership/metadata when the 6622 migration is integrated. Confirm the CMC API supports that scope and concurrency before choosing an encoding or enabling 1v2.

Keep answer state and document references inside the selected draft. Store an optimistic version and update only that draft. Reject stale writes with a recoverable reload/review flow. Separate keys prevent cross-defendant overwrites but do not by themselves prevent same-draft lost updates. A whole-case read-modify-write is insufficient when two defendants submit concurrently: the backend must check the current case version, authorise the slot, and apply a scoped update without erasing the other response. Submission retries require agreed idempotency and a submitted-state check.

Compatibility policy:

1. Preserve current 1v1 draft reads and existing feature-flag behaviour. Do not mass rename, dual-write or delete legacy keys as part of design delivery.
2. Where actor and case resolve unambiguously to defendant 1, an implementation may import a legacy draft once through the owning draft repository. Validate envelope identity/schema and use an atomic create/version check before acknowledging migration.
3. Do not import an ambiguous legacy draft into either slot of a 1v2 case. Route to an agreed recovery journey; do not copy another defendant's answers or silently discard data.
4. Retain the original until verified persistence and the approved retention period allow cleanup. Delete only the selected draft after confirmed submission; preserve a recoverable draft after failure.
5. Rollback must leave v2 drafts available for forward recovery. A rollback build must refuse unsupported 1v2 writes; it must not read v2 as a legacy defendant-1 draft. Deployment and migration flags must allow disabling entry without destroying drafts.

Draft and cache lifetimes must follow the owning repository's agreed policy. Do not introduce another TTL rule here. Session expiry/re-login must re-authorise party context before reopening a draft. Recovery of uploaded references and temporary files must follow 5155/5158, including failed persistence and deletion; changing party context must never delete another party's files.

## Impact and ownership map

| Area | Required implementation and review |
|---|---|
| Claim creation | BA decides eligible 1v2 case/party combinations, service details and notifications. Claim creation must not expose 1v2 before backend acceptance and linking exist. |
| First contact and authorisation | Backend supplies party-bound linking, invitations and capabilities. Review case/document access and representation changes. |
| CCD translation and client | Typed slot adapters, explicit response field allowlists, authorised event context, case-version conflict handling and idempotency contract. Keep 1v1 contracts compatible. |
| Response forms and means | Resolve one defendant context; isolate private financial, vulnerability and contact details according to approved disclosure rules. Never expose the other party's draft means. |
| Dashboard and task lists | List accessible cases without accidental duplicate counts; show the relevant party and deadline. Derive completion per defendant. Claimant combined progress and action eligibility need agreed rules for partial/mixed responses. |
| Claimant response, judgment and settlement | Determine which defendant a payment plan, judgment request, settlement or rejection affects. Do not apply defendant-1 decisions to both parties. BA/backend gate. |
| Mediation, DQ and hearings | Preserve party-specific dates, availability, experts, witnesses, language and adjustments. Agree aggregation and conflicting preferences before enabling. |
| Documents and bundles | Bind references to the authorised party and category; verify server-side ownership for download/delete. Agree disclosure and generated-document labels; do not make private drafts case-wide. |
| Notifications and deadlines | Backend targets the correct party, language and response state, including partial responses and retries. No duplicate or premature messages. |
| GA, query management and payments | Audit existing case-wide and applicant/respondent-role assumptions; explicitly decide party scope. Do not put a defendant ID into unrelated draft keys without a separate contract. |
| Observability | Record sanitised journey/slot, outcome and conflict reason; no PINs, tokens, financial answers or document contents in logs. Track migration conflicts and rejected cross-context access. |

## Delivery sequence and approval gates

4205 delivers this proposed ADR and source inventory. Team sign-off is still required; a PR is a review vehicle, not evidence of agreement. Review participants: Civil CUI and Civil Service technical owners, CCD/role-assignment owner, BA/product for party-response rules, and security/privacy for access and disclosure. Review requests or messages are not sent automatically by this delivery.

Before [4206](https://hmcts.atlassian.net/browse/DTSCCI-4206) starts implementation, record named decisions on: supported party/representation combinations; single versus joint responses; response field/leaf mappings; party-bound linking and authorisation; submission concurrency/idempotency; CMC draft identity/migration; claimant eligibility with partial responses; document/means disclosure; notifications, deadlines and rollout/rollback. Link delivery owners for any missing backend/CCD APIs. None is claimed to exist merely because a similarly named field exists.

After sign-off and the existing Phase 1-3 readiness gates: deliver backend/CCD ownership contracts first; introduce adapters/context and persistence compatibility behind a disabled feature flag; add defendant routes and task projections; then integrate claimant/post-response journeys and approved eligibility. Contract verification must cover real backend ownership, not only frontend mocks. Enable in a controlled environment before any production rollout. This ADR does not commission implementation under 5147 or bypass its dependencies.

## Verification criteria for the later implementation

- Round-trip each supported party's agreed response fields without changing the other response or common case values; cover absent optional fields and unsupported schema versions.
- Authorisation tests: another user, another case, tampered slot, withdrawn role, document ownership and PIN replay are rejected at both service boundaries.
- Two tabs for different defendants retain separate drafts; concurrent same-draft edits detect conflicts; two simultaneous submissions preserve both responses and send each notification once.
- Legacy 1v1 save/resume, existing URLs, Redis/CMC flag states, session expiry, failed upload/save, refresh/retry and rollback retain recoverable state.
- Task lists, deadlines, claimant eligibility and generated documents reflect each supported full/part admission and defence combination; exercise English/Welsh independently for both parties.

This delivery changes documentation only, so it has no runtime QA journey. Later implementation delivery must provide environment-specific preparation, journeys, expected results and evidence for the approved scope. No production behaviour, test result or team approval is asserted here.

## Evidence and limits

Inspected fetched `origin/master` on 30 October 2026 in `civil-citizen-ui`, `civil-service` and `civil-ccd-definition`. This is repository evidence, not verification of production schema, flags or access. No database queries or production changes were made.

- CUI: `src/main/common/models/claim.ts`, `civilClaimResponse.ts`, `ccdResponse/ccdResponse.ts`; `src/main/services/translation/response/ccdTranslation.ts`; `src/main/routes/urls.ts`; `src/main/routes/features/public/firstContact/claimSummaryController.ts`; `src/main/modules/draft-store/draftStoreService.ts`; `src/main/app/client/civilServiceClient.ts`.
- Civil Service: `src/main/java/uk/gov/hmcts/reform/civil/model/CaseData.java`, `CaseDataParent.java`; `controllers/cases/CaseAssignmentController.java`; `enums/CaseRole.java`.
- CCD: `ccd-definition/civil/CaseField/*.json`, with exact field paths/types in the inventory.

Known limit: a complete approved respondent-2 citizen mapping cannot be supplied from the current respondent-1 DTO and numbered legal-representative fields alone. The inventory deliberately exposes missing candidates and unclassified shared fields for backend/CCD review. Do not treat them as implemented API support or silently fill them by naming convention.
