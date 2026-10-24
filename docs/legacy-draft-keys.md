# Legacy user-scoped draft keys

`generateRedisKey` and `generateRedisKeyForGA` share the contract
`resourceId + userId`. The resource comes from the `id` or `appId` route
parameter. Resource IDs are opaque nonempty tokens (including CCD references
and UUIDs). Missing values, arrays, whitespace and JavaScript sentinels are
rejected. Resource punctuation is preserved, not interpreted. The user ID
must be an entire hyphenated UUID, as assigned by IDAM and read from the
authenticated token's `uid` claim. Values are never trimmed or case-normalised.

The UUID is exactly 36 characters. For two accepted keys to be identical,
their last 36 characters (user IDs) must match, and so must the remaining
resource IDs. The old variable-length `123 + abc` / `12 + 3abc` example is
therefore rejected by the user-ID contract. This establishes an unambiguous
boundary without a separator migration.

## Existing data and the CMC database release

Valid persisted keys remain byte-for-byte identical. Existing draft reads,
updates, deletes, suffix stores (including GA documents) and user-ID lookup
continue to address the same records. TTL policy is unchanged. No fallback
lookup, dual write, backfill or rollback migration is introduced. Previously
malformed keys are not searched or migrated because their ownership is not
established by this contract.

The claim-issue durable draft manager uses user-only legacy keys, separate
`draft-claim:` cache keys and the database service. Those APIs, the
`cui-draft-claim-database` flag, retention and payment handling are untouched.
The legacy Redis keys used while the flag is off, or when resuming an in-flight
Redis draft with the flag on, also keep their existing format. This change does
not alter the database-to-Redis rollback work under DTSCCI-6547 or the database
performance work under DTSCCI-6741.

An audit of generator call sites and direct Redis access found other key
families for payments, GA response/HWF data and user-only claim drafts. This
change does not rename those families or claim to validate every raw Redis
caller. A future namespace migration would need to update every reader,
writer, delete and lookup together, with a mixed-version rollout strategy.

## Verification and QA

Automated checks cover rejected identifiers, distinct users/resources, and
read/update/delete of existing keys while retaining TTL and another user's
record. The draft-manager tests cover the database flag on/off and legacy
resume paths.

A QA person must verify defendant response and GA save/resume with pre-release
and newly created drafts, two independent users and two tabs for different
claims/applications. Saved values and document references must remain attached
to the correct context. Repeat claim-issue create/edit/resume and payment
journeys with the database flag off and on, including an in-flight Redis draft
with the flag on. Record environment, flag state, expected/actual outcomes and
sanitised evidence. No production key migration or manual data changes are
required.

IDAM UUID assignment:
https://github.com/hmcts/idam-api/blob/master/idam-api/src/main/java/uk/gov/hmcts/reform/idam/api/v2/service/V2UserService.java
