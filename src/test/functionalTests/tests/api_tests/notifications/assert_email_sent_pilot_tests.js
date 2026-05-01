const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');

let claimRef, caseData, claimNumber;

Feature('Assert email sent helper - pilot - DTSCCI-4270').tag('@api-assert-email-pilot');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Pattern 1 - claim creation notifies the LiP claimant', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  const entry = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });
  console.log('Pattern 1 captured:', entry.reference, entry.templateId);
});

Scenario('Pattern 2 - defendant response notifies the claimant only', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.performCitizenResponse(
    config.defendantCitizenUser, claimRef, 'SmallClaims',
    config.defenceType.rejectAllDisputeAllWithIndividual,
  );

  const claimantEmail = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
  console.log('Pattern 2 - claimant notified:', claimantEmail.reference, claimantEmail.templateId);
});

Scenario('Pattern 3 - judicial referral after respond-to-defence (FastTrack)', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'FastTrack');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.performCitizenResponse(
    config.defendantCitizenUser, claimRef, 'FastTrack',
    config.defenceType.rejectAllDisputeAllWithIndividual,
  );
  await api.claimantLipRespondToDefence(
    config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL',
  );

  const entry = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
  console.log('Pattern 3 captured:', entry.reference, entry.templateId);
});

Scenario('Pattern 4 - assertNoEmailSent for an unknown case returns cleanly', async ({api}) => {
  const unknownCaseId = '999XX999-no-such-case';
  await api.assertNoEmailSent(unknownCaseId, {withinMs: 2000});
  console.log('Pattern 4 verified: no audit entries for', unknownCaseId);
});

Scenario('Pattern 5 - templateId filter returns only matching emails', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  const claimantEmail = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });

  const sameEmailById = await api.assertEmailSent(claimNumber, {
    templateId: claimantEmail.templateId,
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 5000,
  });

  if (sameEmailById.notificationId !== claimantEmail.notificationId) {
    throw new Error(`templateId filter mismatch: expected ${claimantEmail.notificationId}, got ${sameEmailById.notificationId}`);
  }
  console.log('Pattern 5 verified: templateId filter returns the same email');

  await api.assertNoEmailSent(claimNumber, {
    templateId: '00000000-0000-0000-0000-000000000000',
    withinMs: 2000,
  });
  console.log('Pattern 5 verified: unknown templateId returns no matches');
});
