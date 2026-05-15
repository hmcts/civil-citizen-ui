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

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });
});

Scenario('Pattern 2 - defendant reject-all response notifies the claimant only', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.performCitizenResponse(
    config.defendantCitizenUser, claimRef, 'SmallClaims',
    config.defenceType.rejectAllDisputeAllWithIndividual,
  );

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
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

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
});

Scenario('Pattern 4 - assertNoEmailSent for an unknown case returns cleanly', async ({api}) => {
  await api.assertNoEmailSent('999XX999-no-such-case', {withinMs: 2000});
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

  await api.assertNoEmailSent(claimNumber, {
    templateId: '00000000-0000-0000-0000-000000000000',
    withinMs: 2000,
  });
});

Scenario('Pattern 6 - wrong recipientEmail filter returns no match', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });

  await api.assertNoEmailSent(claimNumber, {
    recipientEmail: 'never-received-anything@test.example.com',
    withinMs: 2000,
  });
});

Scenario('Pattern 7 - audit isolation: case A emails do not leak into case B query', async ({api}) => {
  const claimRefA = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  const caseDataA = await api.retrieveCaseData(config.adminUser, claimRefA);
  const claimNumberA = caseDataA.legacyCaseReference;
  const emailA = await api.assertEmailSent(claimNumberA, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });

  const claimRefB = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  const caseDataB = await api.retrieveCaseData(config.adminUser, claimRefB);
  const claimNumberB = caseDataB.legacyCaseReference;
  const emailB = await api.assertEmailSent(claimNumberB, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });

  if (claimNumberA === claimNumberB) {
    throw new Error('Pattern 7 setup failure: case A and B share a claim number');
  }
  if (emailA.notificationId === emailB.notificationId) {
    throw new Error(`Pattern 7 leak: case ${claimNumberA} and case ${claimNumberB} returned the same notification ${emailA.notificationId}`);
  }
  if (!emailA.reference.includes(claimNumberA)) {
    throw new Error(`Pattern 7 leak: query for ${claimNumberA} returned reference ${emailA.reference}`);
  }
  if (!emailB.reference.includes(claimNumberB)) {
    throw new Error(`Pattern 7 leak: query for ${claimNumberB} returned reference ${emailB.reference}`);
  }
});

Scenario('Pattern 8 - assertEmailSent returns immediately for already-sent email', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });

  const startedAt = Date.now();
  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });
  const elapsedMs = Date.now() - startedAt;

  if (elapsedMs > 5000) {
    throw new Error(`Pattern 8 too slow: second lookup took ${elapsedMs}ms (expected <5000ms for already-sent email)`);
  }
});

Scenario('Pattern 9 - assertEmailSent times out cleanly with diagnostic message', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  let thrown;
  try {
    await api.assertEmailSent(claimNumber, {
      templateId: '00000000-0000-0000-0000-000000000000',
      timeoutMs: 4000,
    });
  } catch (err) {
    thrown = err;
  }

  if (!thrown) {
    throw new Error('Pattern 9: expected assertEmailSent to throw on timeout, but it returned');
  }
  if (!thrown.message.includes(claimNumber)) {
    throw new Error(`Pattern 9: timeout error should include caseId. Got: ${thrown.message}`);
  }
  if (!thrown.message.includes('00000000-0000-0000-0000-000000000000')) {
    throw new Error(`Pattern 9: timeout error should include the searched templateId. Got: ${thrown.message}`);
  }
});

Scenario('Pattern 10 - audit captures multiple lifecycle emails on the same case', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  const creationEmail = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 30000,
  });

  await api.performCitizenResponse(
    config.defendantCitizenUser, claimRef, 'SmallClaims',
    config.defenceType.rejectAllDisputeAllWithIndividual,
  );

  let attempts = 0;
  let secondEmail = null;
  while (attempts < 20 && !secondEmail) {
    const candidate = await api.assertEmailSent(claimNumber, {
      recipientEmail: config.claimantCitizenUser.email,
      timeoutMs: 5000,
    });
    if (candidate.notificationId !== creationEmail.notificationId) {
      secondEmail = candidate;
    }
    attempts++;
  }

  if (!secondEmail) {
    throw new Error(`Pattern 10: only the original ${creationEmail.templateId} email was captured for case ${claimNumber} after defendant response`);
  }
  if (secondEmail.templateId === creationEmail.templateId && secondEmail.notificationId === creationEmail.notificationId) {
    throw new Error('Pattern 10: second email is identical to first; lifecycle progression not captured');
  }
});

Scenario('Pattern 11 - defendant full-admit pay immediately notifies the claimant', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.performCitizenResponse(
    config.defendantCitizenUser, claimRef, 'SmallClaims',
    config.defenceType.admitAllPayImmediateWithIndividual,
  );

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
});

Scenario('Pattern 12 - defendant part-admit pay-by-set-date notifies the claimant', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  await api.performCitizenResponse(
    config.defendantCitizenUser, claimRef, 'SmallClaims',
    config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual,
  );

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
});
