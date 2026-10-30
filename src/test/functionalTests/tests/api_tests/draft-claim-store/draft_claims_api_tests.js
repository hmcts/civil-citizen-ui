const {assert} = require('chai');
const {randomUUID} = require('crypto');
const idamHelper = require('../../../specClaimHelpers/api/idamHelper');
const {
  createCitizen,
  createDraftClaim,
  getActiveDraftClaim,
  getDraftClaim,
  getDraftClaimForCase,
  updateDraftClaim,
  deleteDraftClaim,
  applyPaymentRetention,
  sendDraftClaimsRequest,
  sameInstant,
  endOfDayExpiry,
  draftPayload,
  caseReference,
} = require('../../../specClaimHelpers/api/draftClaimStoreHelper');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Feature('Draft claim store - draft claims API').tag('@civil-citizen-nightly @api-draft-claim-store');

Scenario('Creating a draft stores it for 30 days from creation and returns it as the active draft', async () => {
  const user = await createCitizen();
  const payload = draftPayload();
  const created = await createDraftClaim(user, {payload});
  assert.strictEqual(created.status, 201, 'draft creation should succeed');
  assert.match(created.body.draftId, uuidRegex, 'draftId should be a UUID');
  assert.isNotOk(created.body.caseId, 'a new draft should not have a caseId');
  assert.deepEqual(created.body.payload, payload, 'stored payload should match what was sent');
  assert.strictEqual(Date.parse(created.body.expiresAt), endOfDayExpiry(created.body.createdAt, 30), 'a new draft should be kept until the end of its 30th day');

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 200, 'the new draft should be the active draft');
  assert.strictEqual(active.body.draftId, created.body.draftId);
  assert.deepEqual(active.body.payload, payload);

  const fetched = await getDraftClaim(user, created.body.draftId);
  assert.strictEqual(fetched.status, 200);
  assert.strictEqual(fetched.body.draftId, created.body.draftId);
});

Scenario('Creating a draft with 30 retention days in the payload is accepted', async () => {
  const userA = await createCitizen();
  const createdA = await createDraftClaim(userA, {payload: draftPayload({draftClaimCacheTtlDays: 30})});
  assert.strictEqual(createdA.status, 201);
  assert.strictEqual(Date.parse(createdA.body.expiresAt), endOfDayExpiry(createdA.body.createdAt, 30), 'a draft with a numeric draftClaimCacheTtlDays of 30 should be kept until the end of its 30th day');

  const userB = await createCitizen();
  const createdB = await createDraftClaim(userB, {payload: draftPayload({draftClaimCacheTtlDays: '30'})});
  assert.strictEqual(createdB.status, 201);
  assert.strictEqual(Date.parse(createdB.body.expiresAt), endOfDayExpiry(createdB.body.createdAt, 30), 'a draft with a string draftClaimCacheTtlDays of 30 should be kept until the end of its 30th day');
});

Scenario('Creating a draft with any other retention days in the payload is rejected and nothing is stored', async () => {
  const user = await createCitizen();
  for (const value of [7, '14', 0, -5, 'not-a-number', 0.5]) {
    const created = await createDraftClaim(user, {payload: draftPayload({draftClaimCacheTtlDays: value})});
    assert.strictEqual(created.status, 400, `retention days ${value} should be rejected`);
  }

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 404);
});

Scenario('Creating a second draft while one is active is rejected and the first draft is unchanged', async () => {
  const user = await createCitizen();
  const payload = draftPayload();
  const first = await createDraftClaim(user, {payload});
  assert.strictEqual(first.status, 201);

  const second = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(second.status, 409);
  assert.include(second.body, 'An active draft claim already exists');

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 200);
  assert.strictEqual(active.body.draftId, first.body.draftId, 'the first draft should still be active');
  assert.deepEqual(active.body.payload, payload);
  assert.isTrue(sameInstant(active.body.createdAt, first.body.createdAt), 'createdAt should be unchanged');
  assert.isTrue(sameInstant(active.body.expiresAt, first.body.expiresAt), 'expiresAt should be unchanged');
});

Scenario('Creating a draft is rejected for a case id, a missing payload or malformed JSON and nothing is stored', async () => {
  const user = await createCitizen();

  const withCaseId = await createDraftClaim(user, {caseId: caseReference(), payload: draftPayload()});
  assert.strictEqual(withCaseId.status, 400, 'a non-blank caseId on create should be rejected');

  const missingPayload = await createDraftClaim(user, {});
  assert.strictEqual(missingPayload.status, 400, 'a missing payload should be rejected');

  const notAnObject = await createDraftClaim(user, {payload: 'not-an-object'});
  assert.strictEqual(notAnObject.status, 400, 'a non-object payload should be rejected');

  const token = await idamHelper.accessToken(user);
  const malformed = await sendDraftClaimsRequest('POST', '', {token, rawBody: '{"payload": '});
  assert.strictEqual(malformed.status, 400, 'malformed JSON should be rejected');

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 404, 'nothing should have been stored');
});

Scenario('Five simultaneous create requests store exactly one draft', async () => {
  const user = await createCitizen();
  const results = await Promise.all(
    Array.from({length: 5}, () => createDraftClaim(user, {payload: draftPayload()})),
  );
  const statuses = results.map(r => r.status).sort((a, b) => a - b);
  assert.deepEqual(statuses, [201, 409, 409, 409, 409]);

  const created = results.find(r => r.status === 201);
  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 200);
  assert.strictEqual(active.body.draftId, created.body.draftId);
});

Scenario('Saving a draft keeps its creation and deletion dates and moves its last updated date', async () => {
  const user = await createCitizen();
  const created = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(created.status, 201);

  await new Promise(resolve => setTimeout(resolve, 1100));

  const updated = await updateDraftClaim(user, created.body.draftId, {payload: draftPayload({totalClaimAmount: 12345})});
  assert.strictEqual(updated.status, 200);
  assert.isTrue(sameInstant(updated.body.createdAt, created.body.createdAt), 'createdAt should never change');
  assert.isTrue(sameInstant(updated.body.expiresAt, created.body.expiresAt), 'expiresAt should never change');
  assert.isAbove(Date.parse(updated.body.updatedAt), Date.parse(created.body.updatedAt), 'updatedAt should move forward');

  const fetched = await getDraftClaim(user, created.body.draftId);
  assert.strictEqual(fetched.body.payload.totalClaimAmount, 12345);
});

Scenario('Linking a draft to a submitted claim keeps it apart from a new blank draft', async () => {
  const user = await createCitizen();
  const case1 = caseReference();
  const case2 = caseReference();

  const d1 = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(d1.status, 201);

  const linked1 = await updateDraftClaim(user, d1.body.draftId, {caseId: case1, payload: draftPayload()});
  assert.strictEqual(linked1.status, 200);
  assert.strictEqual(linked1.body.caseId, case1);
  assert.isTrue(sameInstant(linked1.body.expiresAt, d1.body.expiresAt), 'expiresAt should be unchanged after linking');

  const activeAfterLink = await getActiveDraftClaim(user);
  assert.strictEqual(activeAfterLink.status, 404, 'a linked draft is no longer the active draft');

  const byCase1First = await getDraftClaimForCase(user, case1);
  assert.strictEqual(byCase1First.status, 200);
  assert.strictEqual(byCase1First.body.draftId, d1.body.draftId);

  const d2 = await createDraftClaim(user, {payload: {}});
  assert.strictEqual(d2.status, 201, 'a blank payload should be a valid new draft');
  assert.notStrictEqual(d2.body.draftId, d1.body.draftId);

  const activeAfterD2 = await getActiveDraftClaim(user);
  assert.strictEqual(activeAfterD2.status, 200);
  assert.strictEqual(activeAfterD2.body.draftId, d2.body.draftId);

  const byCase1Second = await getDraftClaimForCase(user, case1);
  assert.strictEqual(byCase1Second.status, 200);
  assert.strictEqual(byCase1Second.body.draftId, d1.body.draftId, 'linking d2 should not disturb d1');

  const linked2 = await updateDraftClaim(user, d2.body.draftId, {caseId: case2, payload: draftPayload()});
  assert.strictEqual(linked2.status, 200);

  const byCase2 = await getDraftClaimForCase(user, case2);
  assert.strictEqual(byCase2.status, 200);
  assert.strictEqual(byCase2.body.draftId, d2.body.draftId);

  const byCase1Third = await getDraftClaimForCase(user, case1);
  assert.strictEqual(byCase1Third.status, 200);
  assert.strictEqual(byCase1Third.body.draftId, d1.body.draftId);
});

Scenario('Starting payment keeps a submitted claim\'s draft until the end of the 7th day', async () => {
  const user = await createCitizen();
  const created = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(created.status, 201);

  const caseRef = caseReference();
  const linked = await updateDraftClaim(user, created.body.draftId, {caseId: caseRef, payload: draftPayload()});
  assert.strictEqual(linked.status, 200);

  const retained = await applyPaymentRetention(user, created.body.draftId);
  assert.strictEqual(retained.status, 200);
  assert.strictEqual(Date.parse(retained.body.expiresAt), endOfDayExpiry(retained.body.updatedAt, 7), 'starting payment should keep the draft until the end of the 7th day');

  const byCase = await getDraftClaimForCase(user, caseRef);
  assert.strictEqual(byCase.status, 200);
  assert.isTrue(sameInstant(byCase.body.expiresAt, retained.body.expiresAt), 'the linked draft should have the retained expiry');
});

Scenario('Starting payment again never extends the deletion date', async () => {
  const user = await createCitizen();
  const created = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(created.status, 201);

  const first = await applyPaymentRetention(user, created.body.draftId);
  assert.strictEqual(first.status, 200);

  const second = await applyPaymentRetention(user, created.body.draftId);
  assert.strictEqual(second.status, 200);
  assert.isTrue(sameInstant(second.body.expiresAt, first.body.expiresAt), 'a second payment attempt should not extend the deletion date');
});

Scenario('Payment retention is rejected for an unknown, malformed or another citizen\'s draft', async () => {
  const unknownUser = await createCitizen();
  const unknown = await applyPaymentRetention(unknownUser, randomUUID());
  assert.strictEqual(unknown.status, 404);

  const malformed = await applyPaymentRetention(unknownUser, 'not-a-uuid');
  assert.strictEqual(malformed.status, 400);

  const citizenA = await createCitizen();
  const citizenB = await createCitizen();
  const createdA = await createDraftClaim(citizenA, {payload: draftPayload()});
  assert.strictEqual(createdA.status, 201);

  const bAttempt = await applyPaymentRetention(citizenB, createdA.body.draftId);
  assert.strictEqual(bAttempt.status, 404, 'another citizen should not be able to start payment retention on the draft');

  const aAfter = await getDraftClaim(citizenA, createdA.body.draftId);
  assert.strictEqual(aAfter.status, 200);
  assert.isTrue(sameInstant(aAfter.body.expiresAt, createdA.body.expiresAt), 'the draft expiry should be unaffected by another citizen\'s attempt');

  const noToken = await sendDraftClaimsRequest('PUT', `/${createdA.body.draftId}/payment-retention`);
  assert.include([401, 403], noToken.status, 'payment retention without a token should be rejected');

  const invalidToken = await sendDraftClaimsRequest('PUT', `/${createdA.body.draftId}/payment-retention`, {token: 'not-a-token'});
  assert.include([401, 403], invalidToken.status, 'payment retention with an invalid token should be rejected');
});

Scenario('Updating a draft is rejected for an unknown or malformed id, a missing payload or an over-long case id', async () => {
  const user = await createCitizen();
  const payload = draftPayload();
  const d1 = await createDraftClaim(user, {payload});
  assert.strictEqual(d1.status, 201);

  const unknown = await updateDraftClaim(user, randomUUID(), {payload});
  assert.strictEqual(unknown.status, 404);

  const malformedId = await updateDraftClaim(user, 'not-a-uuid', {payload});
  assert.strictEqual(malformedId.status, 400);

  const missingPayload = await updateDraftClaim(user, d1.body.draftId, {});
  assert.strictEqual(missingPayload.status, 400);

  const overLongCaseId = await updateDraftClaim(user, d1.body.draftId, {caseId: '1'.repeat(201), payload});
  assert.strictEqual(overLongCaseId.status, 400);

  const fetched = await getDraftClaim(user, d1.body.draftId);
  assert.strictEqual(fetched.status, 200);
  assert.deepEqual(fetched.body.payload, payload, 'payload should be unchanged after the rejected updates');
  assert.isNotOk(fetched.body.caseId, 'caseId should still be unset');
});

Scenario('Saving a draft with a blank case id keeps it as the active draft', async () => {
  const user = await createCitizen();
  const created = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(created.status, 201);

  const updated = await updateDraftClaim(user, created.body.draftId, {caseId: '   ', payload: draftPayload({totalClaimAmount: 4321})});
  assert.strictEqual(updated.status, 200);
  assert.isNotOk(updated.body.caseId, 'a blank case id should not link the draft to a claim');

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 200);
  assert.strictEqual(active.body.draftId, created.body.draftId);
  assert.strictEqual(active.body.payload.totalClaimAmount, 4321);
});

Scenario('Deleting a draft removes it for good and a new draft can then be started', async () => {
  const user = await createCitizen();
  const created = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(created.status, 201);

  const deleted = await deleteDraftClaim(user, created.body.draftId);
  assert.strictEqual(deleted.status, 204);

  const fetched = await getDraftClaim(user, created.body.draftId);
  assert.strictEqual(fetched.status, 404);

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 404);

  const deletedAgain = await deleteDraftClaim(user, created.body.draftId);
  assert.strictEqual(deletedAgain.status, 404);

  const newDraft = await createDraftClaim(user, {payload: draftPayload()});
  assert.strictEqual(newDraft.status, 201);
  assert.notStrictEqual(newDraft.body.draftId, created.body.draftId);
});

Scenario('A citizen cannot see, change or delete another citizen\'s draft', async () => {
  const citizenA = await createCitizen();
  const citizenB = await createCitizen();
  const payload = draftPayload();
  const caseA = caseReference();

  const dA = await createDraftClaim(citizenA, {payload});
  assert.strictEqual(dA.status, 201);
  const linked = await updateDraftClaim(citizenA, dA.body.draftId, {caseId: caseA, payload});
  assert.strictEqual(linked.status, 200);

  const bGet = await getDraftClaim(citizenB, dA.body.draftId);
  assert.strictEqual(bGet.status, 404, 'another citizen should not be able to view the draft');

  const bPut = await updateDraftClaim(citizenB, dA.body.draftId, {payload: draftPayload()});
  assert.strictEqual(bPut.status, 404, 'another citizen should not be able to update the draft');

  const bDelete = await deleteDraftClaim(citizenB, dA.body.draftId);
  assert.strictEqual(bDelete.status, 404, 'another citizen should not be able to delete the draft');

  const bByCase = await getDraftClaimForCase(citizenB, caseA);
  assert.strictEqual(bByCase.status, 404, 'another citizen should not be able to look up the draft by case id');

  const bActive = await getActiveDraftClaim(citizenB);
  assert.strictEqual(bActive.status, 404);

  const aGet = await getDraftClaim(citizenA, dA.body.draftId);
  assert.strictEqual(aGet.status, 200);
  assert.deepEqual(aGet.body.payload, payload, 'the owner\'s draft should be unaffected');
});

Scenario('The draft claims API rejects requests without a valid token', async () => {
  const requests = [
    ['POST', ''],
    ['GET', '/active'],
    ['GET', `/${randomUUID()}`],
    ['GET', `/case/${caseReference()}`],
    ['PUT', `/${randomUUID()}`],
    ['DELETE', `/${randomUUID()}`],
  ];

  for (const [method, path] of requests) {
    const rawBody = ['POST', 'PUT'].includes(method) ? '{"payload":{}}' : undefined;

    const noToken = await sendDraftClaimsRequest(method, path, {rawBody});
    assert.include([401, 403], noToken.status, `${method} ${path} without a token should be rejected`);

    const invalidToken = await sendDraftClaimsRequest(method, path, {token: 'not-a-token', rawBody});
    assert.include([401, 403], invalidToken.status, `${method} ${path} with an invalid token should be rejected`);
  }
});

Scenario('Looking up drafts that do not exist returns not found and a malformed id is rejected', async () => {
  const user = await createCitizen();

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 404);

  const unknown = await getDraftClaim(user, randomUUID());
  assert.strictEqual(unknown.status, 404);

  const malformed = await getDraftClaim(user, 'not-a-uuid');
  assert.strictEqual(malformed.status, 400);

  const unknownCase = await getDraftClaimForCase(user, '9999999999999999');
  assert.strictEqual(unknownCase.status, 404);
});
