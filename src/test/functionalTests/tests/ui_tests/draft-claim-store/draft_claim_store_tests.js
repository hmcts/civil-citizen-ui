const {assert} = require('chai');
const draftClaimStoreSteps = require('../../../citizenFeatures/createClaim/steps/draftClaimStoreSteps');
const {
  isDraftClaimDatabaseEnabled,
  getActiveDraftClaim,
  getDraftClaim,
  updateDraftClaim,
  deleteDraftClaim,
  sameInstant,
  endOfDayExpiry,
  deletionDate,
  daysFromNow,
} = require('../../../specClaimHelpers/api/draftClaimStoreHelper');

Feature('Draft claim store - save and resume a draft claim').tag('@civil-citizen-nightly @ui-draft-claim-store');

Scenario('A claim started through eligibility is saved, shows its deletion date and resumes after signing in again', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const startedAt = Date.now();
  const user = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.startClaimThroughEligibility();

  const afterEligibility = await getActiveDraftClaim(user);
  let created;
  if (databaseEnabled) {
    assert.strictEqual(afterEligibility.status, 200, 'a draft should be stored when the database flag is on');
    assert.strictEqual(Date.parse(afterEligibility.body.expiresAt), endOfDayExpiry(afterEligibility.body.createdAt, 30), 'a new draft should keep its retention for 30 days');
    created = afterEligibility.body;
  } else {
    assert.strictEqual(afterEligibility.status, 404, 'nothing should be stored when the database flag is off');
  }

  await draftClaimStoreSteps.completeClaimTasks();

  const afterTasks = await getActiveDraftClaim(user);
  let expectedDates;
  if (databaseEnabled) {
    assert.strictEqual(afterTasks.status, 200);
    assert.strictEqual(afterTasks.body.draftId, created.draftId);
    assert.isTrue(sameInstant(afterTasks.body.createdAt, created.createdAt), 'createdAt should never change');
    assert.isTrue(sameInstant(afterTasks.body.expiresAt, created.expiresAt), 'expiresAt should never change');
    assert.isAbove(Date.parse(afterTasks.body.updatedAt), Date.parse(created.updatedAt), 'updatedAt should move forward while completing the claim');
    assert.strictEqual(afterTasks.body.payload.claimDetails.reason.text, 'Unprofessional Builder');
    const saved = afterTasks.body.payload;
    assert.strictEqual(saved.claimantBilingualLanguagePreference, 'ENGLISH', 'language page should be saved to the database');
    assert.isOk(saved.resolvingDispute, 'resolving this dispute page should be saved to the database');
    assert.isOk(saved.completingClaimConfirmed, 'completing your claim page should be saved to the database');
    assert.strictEqual(saved.applicant1.partyDetails.firstName, 'Joe', 'claimant details should be saved to the database');
    assert.strictEqual(saved.applicant1.partyDetails.lastName, 'Bloggs', 'claimant details should be saved to the database');
    assert.strictEqual(saved.applicant1.partyPhone.phone, '07818731017', 'claimant phone number should be saved to the database');
    assert.strictEqual(saved.applicant1.dateOfBirth.year, 1975, 'claimant date of birth should be saved to the database');
    assert.strictEqual(saved.respondent1.partyDetails.firstName, 'Jane', 'defendant details should be saved to the database');
    assert.strictEqual(saved.respondent1.partyDetails.lastName, 'Doe', 'defendant details should be saved to the database');
    assert.deepEqual(
      saved.claimAmountBreakup.map(row => row.value.claimReason),
      ['Broken bathroom', 'Lost Tap', 'Late Delivery', 'Temporary Entry for Automation Blur'],
      'claim amount page should be saved to the database',
    );
    assert.strictEqual(saved.totalClaimAmount, 1520, 'claim amount page should be saved to the database');
    assert.strictEqual(saved.interest.interestClaimOptions, 'SAME_RATE_INTEREST', 'claim interest page should be saved to the database');
    assert.strictEqual(saved.claimDetails.timeline.rows[0].description, 'Drafting of Contracts', 'claim timeline page should be saved to the database');
    assert.include(
      saved.claimDetails.evidence.evidenceItem.map(item => item.type),
      'Contracts and agreements',
      'evidence page should be saved to the database',
    );
    assert.strictEqual(saved.claimDetails.helpWithFees.option, 'no', 'help with fees page should be saved to the database');
    expectedDates = [deletionDate(Date.parse(afterTasks.body.expiresAt) - 1)];
  } else {
    assert.strictEqual(afterTasks.status, 404);
    expectedDates = [deletionDate(daysFromNow(30, startedAt)), deletionDate(daysFromNow(30))];
  }

  const expectedStatuses = expectedDates.map(d => `Submit by ${d} or claim will be deleted`);
  const dashboardStatus = await draftClaimStoreSteps.draftClaimStatusOnDashboard();
  assert.include(expectedStatuses, dashboardStatus, 'dashboard should show the expected deletion date');

  const banner = await draftClaimStoreSteps.openDraftClaimFromDashboard();
  assert.isOk(
    expectedDates.some(d => banner.includes(`it will be deleted on ${d}.`)),
    `banner "${banner}" should mention one of the expected deletion dates`,
  );

  await draftClaimStoreSteps.signInAgain(user);
  const statusAfterSignIn = await draftClaimStoreSteps.draftClaimStatusOnDashboard();
  assert.strictEqual(statusAfterSignIn, dashboardStatus, 'dashboard status should be unchanged after signing in again');

  await draftClaimStoreSteps.openDraftClaimFromDashboard();
  await draftClaimStoreSteps.continueWithClaim();
  const tasks = await draftClaimStoreSteps.taskStatuses();
  for (const name of ['Resolving this dispute', 'Completing your claim', 'Your details', 'Their details', 'Claim amount', 'Claim details']) {
    assert.strictEqual(tasks[name], 'Complete', `${name} should be Complete after resuming`);
  }
});

Scenario('A citizen with a draft who starts a claim again carries on with the same draft', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const user = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.createCompleteDraft();

  let draftIdBefore;
  if (databaseEnabled) {
    const active = await getActiveDraftClaim(user);
    assert.strictEqual(active.status, 200);
    draftIdBefore = active.body.draftId;
  }

  const language = await draftClaimStoreSteps.languagePageHeading();
  assert.notInclude(language.text, 'Something went wrong');
  assert.include(language.text, 'In what language do you want to make your claim?');

  if (databaseEnabled) {
    const activeAfter = await getActiveDraftClaim(user);
    assert.strictEqual(activeAfter.status, 200);
    assert.strictEqual(activeAfter.body.draftId, draftIdBefore, 'returning to the journey should reuse the same draft');
  } else {
    const activeAfter = await getActiveDraftClaim(user);
    assert.strictEqual(activeAfter.status, 404);
  }

  const dashboardStatus = await draftClaimStoreSteps.draftClaimStatusOnDashboard();
  assert.isNotNull(dashboardStatus);
});

Scenario('Check your answers sends a citizen to eligibility, the incomplete submission page or the answers for their draft', async () => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  const user = await draftClaimStoreSteps.signInAsNewClaimant();

  const noDraftUrl = await draftClaimStoreSteps.checkYourAnswersUrl();
  assert.include(noDraftUrl, '/eligibility');

  await draftClaimStoreSteps.startClaimThroughEligibility();
  const incompleteUrl = await draftClaimStoreSteps.checkYourAnswersUrl();
  assert.include(incompleteUrl, '/claim/incomplete-submission');

  await draftClaimStoreSteps.createCompleteDraft();
  await draftClaimStoreSteps.openCheckYourAnswers();

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, databaseEnabled ? 200 : 404, 'exactly one active draft should remain when the database flag is on');
});

Scenario('A deleted draft is no longer shown or resumable', async () => {
  if (!(await isDraftClaimDatabaseEnabled())) return;

  const user = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.createCompleteDraft();

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 200);

  const statusBeforeDelete = await draftClaimStoreSteps.draftClaimStatusOnDashboard();
  assert.isNotNull(statusBeforeDelete);

  const deleted = await deleteDraftClaim(user, active.body.draftId);
  assert.strictEqual(deleted.status, 204);

  const statusAfterDelete = await draftClaimStoreSteps.draftClaimStatusOnDashboard();
  assert.isNull(statusAfterDelete);

  const restartUrl = await draftClaimStoreSteps.checkYourAnswersUrl();
  const restartedAtLanguagePage = restartUrl.includes('/claim/bilingual-language-preference');
  assert.isTrue(restartedAtLanguagePage || restartUrl.includes('/eligibility'), 'check your answers should send the citizen to start a new claim');

  const deletedDraft = await getDraftClaim(user, active.body.draftId);
  assert.strictEqual(deletedDraft.status, 404, 'the deleted draft should be gone for good');

  const activeAfterDelete = await getActiveDraftClaim(user);
  if (restartedAtLanguagePage) {
    assert.strictEqual(activeAfterDelete.status, 200);
    assert.notStrictEqual(activeAfterDelete.body.draftId, active.body.draftId);
    assert.isNotOk(activeAfterDelete.body.payload.applicant1, 'the deleted answers must not come back');
  } else {
    assert.strictEqual(activeAfterDelete.status, 404);
  }
});

Scenario('Claim pages show the answers held in the database', async ({I}) => {
  const databaseEnabled = await isDraftClaimDatabaseEnabled();
  if (!databaseEnabled) return;

  const user = await draftClaimStoreSteps.signInAsNewClaimant();
  await draftClaimStoreSteps.createCompleteDraft();

  const active = await getActiveDraftClaim(user);
  assert.strictEqual(active.status, 200);

  const reason = `Reason saved straight to the database ${Date.now()}`;
  const copy = JSON.parse(JSON.stringify(active.body.payload));
  copy.claimDetails.reason = {text: reason};
  const updated = await updateDraftClaim(user, active.body.draftId, {payload: copy});
  assert.strictEqual(updated.status, 200);

  await I.amOnPage('/claim/reason');
  await I.waitForElement('#text', 60);
  assert.strictEqual(await I.grabValueFrom('#text'), reason, 'the claim reason page should show the answer held in the database');

  await draftClaimStoreSteps.openCheckYourAnswers();
  await I.see(reason);
});
