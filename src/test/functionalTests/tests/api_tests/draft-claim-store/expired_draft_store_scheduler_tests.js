const {assert} = require('chai');
const {
  createCitizen,
  createDraftClaim,
  getDraftClaim,
  draftPayload,
  sameInstant,
  runExpiredDraftStoreScheduler,
  getSchedulers,
} = require('../../../specClaimHelpers/api/draftClaimStoreHelper');

Feature('Draft claim store - expired draft clean-up job').tag('@civil-citizen-nightly @api-draft-claim-store');

Scenario('The expired draft clean-up job is registered as an active scheduled job', async () => {
  const schedulers = await getSchedulers();
  assert.strictEqual(schedulers.status, 200);
  assert.include(schedulers.body, 'ExpiredDraftStore');
});

Scenario('Running the clean-up job keeps drafts that have not expired', async () => {
  const user = await createCitizen();
  const payload = draftPayload();
  const created = await createDraftClaim(user, {payload});
  assert.strictEqual(created.status, 201);

  const scheduler = await runExpiredDraftStoreScheduler();
  assert.strictEqual(scheduler.status, 202);

  await new Promise(resolve => setTimeout(resolve, 15000));

  const fetched = await getDraftClaim(user, created.body.draftId);
  assert.strictEqual(fetched.status, 200);
  assert.deepEqual(fetched.body.payload, payload);
  assert.isTrue(sameInstant(fetched.body.expiresAt, created.body.expiresAt), 'expiresAt should be unchanged');
});
