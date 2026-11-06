const {assert} = require('chai');
const draftClaimStoreSteps = require('../../../citizenFeatures/createClaim/steps/draftClaimStoreSteps');
const {
  isDraftClaimDatabaseEnabled,
  getActiveDraftClaim,
  getDraftClaimForCase,
  deleteDraftClaim,
  sameInstant,
  endOfDayExpiry,
  claimantCaseIds,
} = require('../../../specClaimHelpers/api/draftClaimStoreHelper');

Feature('Draft claim store - submit and pay the claim fee').tag('@civil-citizen-nightly @ui-draft-claim-store');

const trackingRow = async (claimant, caseRef) => {
  let response = await getDraftClaimForCase(claimant, caseRef);
  for (let attempt = 1; attempt < 12 && response.status !== 200; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    response = await getDraftClaimForCase(claimant, caseRef);
  }
  assert.strictEqual(response.status, 200, 'a claim submitted with the database flag off should have a tracking row');
  assert.strictEqual(response.body.caseId, caseRef, 'the tracking row should be linked to the claim');
  assert.isEmpty(response.body.payload || {}, 'the tracking row should hold no answers');
  assert.strictEqual(Date.parse(response.body.expiresAt), endOfDayExpiry(response.body.createdAt, 30), 'the tracking row should expire at the end of day 30');
  return response.body;
};

const draftAfterPayment = async (databaseEnabled, claimant, caseRef) => {
  if (databaseEnabled) {
    assert.strictEqual((await getDraftClaimForCase(claimant, caseRef)).status, 404, 'the draft should be deleted once the fee is paid');
  } else {
    await trackingRow(claimant, caseRef);
  }
};

const submittedByCard = async (databaseEnabled) => {
  const claimant = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.createCompleteDraft();
  let created = null;
  if (databaseEnabled) {
    const active = await getActiveDraftClaim(claimant);
    assert.strictEqual(active.status, 200, 'the new draft should be stored in the database');
    created = active.body;
  }
  const caseRef = await draftClaimStoreSteps.submitClaim(false);
  return {claimant, caseRef, created};
};

Scenario('Card payment keeps the draft until the claim fee is paid and a new claim then starts blank', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const {claimant, caseRef, created} = await submittedByCard(databaseEnabled);

  if (databaseEnabled) {
    const byCaseAfterSubmit = await getDraftClaimForCase(claimant, caseRef);
    assert.strictEqual(byCaseAfterSubmit.status, 200);
    assert.strictEqual(byCaseAfterSubmit.body.draftId, created.draftId);
    assert.strictEqual(byCaseAfterSubmit.body.caseId, caseRef);
    assert.isTrue(sameInstant(byCaseAfterSubmit.body.expiresAt, created.expiresAt), 'expiresAt should be unchanged after linking to the claim');

    const activeAfterSubmit = await getActiveDraftClaim(claimant);
    assert.strictEqual(activeAfterSubmit.status, 404, 'the linked draft should no longer be the active draft');
  } else {
    const activeAfterSubmit = await getActiveDraftClaim(claimant);
    assert.strictEqual(activeAfterSubmit.status, 404);
    await trackingRow(claimant, caseRef);
  }

  assert.isNull(await draftClaimStoreSteps.draftClaimStatusOnDashboard(), 'a submitted claim should not show as a draft');

  const paymentStartedAt = Date.now();
  await draftClaimStoreSteps.openClaimFeePage(caseRef);
  await draftClaimStoreSteps.continueToCardPayment();

  if (databaseEnabled) {
    const byCaseBeforePay = await getDraftClaimForCase(claimant, caseRef);
    assert.isOk(byCaseBeforePay.body.payload.claimDetails.claimFeePayment.paymentReference, 'a payment reference should be saved before paying');
    assert.include(
      [endOfDayExpiry(paymentStartedAt, 7), endOfDayExpiry(Date.now(), 7)],
      Date.parse(byCaseBeforePay.body.expiresAt),
      'starting payment should keep the draft until the end of the 7th day',
    );
  }

  const paidUrl = await draftClaimStoreSteps.payByCard();
  assert.include(paidUrl, '/payment-successful');

  await draftAfterPayment(databaseEnabled, claimant, caseRef);
  const activeAfterPay = await getActiveDraftClaim(claimant);
  assert.strictEqual(activeAfterPay.status, 404);

  assert.isNull(await draftClaimStoreSteps.draftClaimStatusOnDashboard());

  const tasks = await draftClaimStoreSteps.startClaimThroughEligibility();
  assert.strictEqual(tasks['Your details'], 'Incomplete');

  const newActive = await getActiveDraftClaim(claimant);
  if (databaseEnabled) {
    assert.strictEqual(newActive.status, 200);
    assert.notStrictEqual(newActive.body.draftId, created.draftId, 'the new claim should get a fresh draft');
    assert.isNotOk(
      newActive.body.payload.claimDetails && newActive.body.payload.claimDetails.reason,
      'the new draft should not carry over the paid claim\'s answers',
    );
  } else {
    assert.strictEqual(newActive.status, 404);
  }
});

Scenario('Help with Fees claim deletes the draft when it is submitted', async () => {
  const claimant = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.createCompleteDraft();
  await draftClaimStoreSteps.addHelpWithFeesReference();
  const caseRef = await draftClaimStoreSteps.submitClaim(true);

  const active = await getActiveDraftClaim(claimant);
  assert.strictEqual(active.status, 404);
  if (await isDraftClaimDatabaseEnabled()) {
    assert.strictEqual((await getDraftClaimForCase(claimant, caseRef)).status, 404, 'the draft should be deleted when a Help with Fees claim is submitted');
  } else {
    await trackingRow(claimant, caseRef);
  }

  assert.isNull(await draftClaimStoreSteps.draftClaimStatusOnDashboard());
});

Scenario('Declined card keeps the draft with its payment reference and the retry pays the fee', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const {claimant, caseRef} = await submittedByCard(databaseEnabled);

  await draftClaimStoreSteps.openClaimFeePage(caseRef);
  await draftClaimStoreSteps.continueToCardPayment();
  const declinedUrl = await draftClaimStoreSteps.declineCard();
  assert.include(declinedUrl, '/payment-unsuccessful');

  const byCaseAfterDecline = await getDraftClaimForCase(claimant, caseRef);
  if (databaseEnabled) {
    assert.strictEqual(byCaseAfterDecline.status, 200);
    assert.isOk(byCaseAfterDecline.body.payload.claimDetails.claimFeePayment.paymentReference, 'a payment reference should be kept after a decline');
  } else {
    await trackingRow(claimant, caseRef);
  }

  await draftClaimStoreSteps.retryPayment();
  const paidUrl = await draftClaimStoreSteps.payByCard();
  assert.include(paidUrl, '/payment-successful');

  await draftAfterPayment(databaseEnabled, claimant, caseRef);
});

Scenario('Cancelled payment keeps the draft and the fee can be paid later from the dashboard', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const {claimant, caseRef} = await submittedByCard(databaseEnabled);

  await draftClaimStoreSteps.openClaimFeePage(caseRef);
  await draftClaimStoreSteps.continueToCardPayment();
  const cancelledUrl = await draftClaimStoreSteps.cancelPayment();
  assert.include(cancelledUrl, '/dashboard');

  if (databaseEnabled) {
    assert.strictEqual((await getDraftClaimForCase(claimant, caseRef)).status, 200, 'the draft should be kept after a cancelled payment');
  } else {
    await trackingRow(claimant, caseRef);
  }

  await draftClaimStoreSteps.openClaimFeePage(caseRef);
  await draftClaimStoreSteps.continueToCardPayment();
  const paidUrl = await draftClaimStoreSteps.payByCard();
  assert.include(paidUrl, '/payment-successful');

  await draftAfterPayment(databaseEnabled, claimant, caseRef);
});

Scenario('A new claim started while a submitted claim is unpaid starts blank and paying the first claim keeps it', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const {claimant, caseRef, created} = await submittedByCard(databaseEnabled);

  const tasks = await draftClaimStoreSteps.startClaimThroughEligibility();
  assert.strictEqual(tasks['Your details'], 'Incomplete');

  let newDraftId;
  if (databaseEnabled) {
    const activeAfterNewClaim = await getActiveDraftClaim(claimant);
    assert.strictEqual(activeAfterNewClaim.status, 200);
    newDraftId = activeAfterNewClaim.body.draftId;

    const byCaseAfterNewClaim = await getDraftClaimForCase(claimant, caseRef);
    assert.strictEqual(byCaseAfterNewClaim.status, 200);
    assert.strictEqual(byCaseAfterNewClaim.body.draftId, created.draftId);
  } else {
    assert.strictEqual((await getActiveDraftClaim(claimant)).status, 404);
    await trackingRow(claimant, caseRef);
  }

  assert.isNotNull(await draftClaimStoreSteps.draftClaimStatusOnDashboard());

  await draftClaimStoreSteps.openClaimFeePage(caseRef);
  await draftClaimStoreSteps.continueToCardPayment();
  const paidUrl = await draftClaimStoreSteps.payByCard();
  assert.include(paidUrl, '/payment-successful');

  if (databaseEnabled) {
    const byCaseAfterPay = await getDraftClaimForCase(claimant, caseRef);
    assert.strictEqual(byCaseAfterPay.status, 404);

    const activeAfterPay = await getActiveDraftClaim(claimant);
    assert.strictEqual(activeAfterPay.status, 200);
    assert.strictEqual(activeAfterPay.body.draftId, newDraftId, 'the new draft should survive paying the first claim');
  } else {
    await trackingRow(claimant, caseRef);
    assert.strictEqual((await getActiveDraftClaim(claimant)).status, 404);
  }

  assert.isNotNull(await draftClaimStoreSteps.draftClaimStatusOnDashboard());
});

Scenario('The claim fee can still be paid when the claim\'s draft is missing', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  if (!databaseEnabled) return;

  const {claimant, caseRef} = await submittedByCard(databaseEnabled);
  const byCase = await getDraftClaimForCase(claimant, caseRef);
  assert.strictEqual(byCase.status, 200);
  const deleted = await deleteDraftClaim(claimant, byCase.body.draftId);
  assert.strictEqual(deleted.status, 204);

  await draftClaimStoreSteps.openClaimFeePage(caseRef);
  await draftClaimStoreSteps.continueToCardPayment();
  const paidUrl = await draftClaimStoreSteps.payByCard();
  assert.include(paidUrl, '/payment-successful');

  const byCaseAfterPay = await getDraftClaimForCase(claimant, caseRef);
  assert.strictEqual(byCaseAfterPay.status, 404);
  const activeAfterPay = await getActiveDraftClaim(claimant);
  assert.strictEqual(activeAfterPay.status, 404);
});

Scenario('Retrying a submission whose response was lost creates only one claim', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const claimant = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.createCompleteDraft();
  await draftClaimStoreSteps.submitClaimWithLostResponse();

  const retryUrl = await draftClaimStoreSteps.checkYourAnswersUrl();
  assert.notInclude(retryUrl, '/claim/check-and-send', 'the submitted claim should not be offered for submission again');

  let ids = await claimantCaseIds(claimant);
  const deadline = Date.now() + 3 * 60000;
  while (ids.length < 1 && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 15000));
    ids = await claimantCaseIds(claimant);
  }
  await new Promise(resolve => setTimeout(resolve, 30000));
  ids = await claimantCaseIds(claimant);
  assert.lengthOf(ids, 1, 'only one claim should be created');

  const byCase = await getDraftClaimForCase(claimant, ids[0]);
  const active = await getActiveDraftClaim(claimant);
  if (databaseEnabled) {
    assert.strictEqual(byCase.status, 200);
    assert.strictEqual(active.status, 404);
  } else {
    await trackingRow(claimant, ids[0]);
    assert.strictEqual(active.status, 404);
  }
});
