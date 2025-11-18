const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Claimant and Defendant Journey - Hearing @qm').tag('@nightly');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

async function loginAndOpenClaim(I, user, claimNumber) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
}

Scenario('Claimant sends message to court', async ({ api, I }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  console.log('LIP vs LIP QM claim created:', claimRef);

  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  console.log('Claim number:', claimNumber);

  const subject = 'Claimant Hearing query';
  const message = 'Claimant Hearing Test message';
  const isHearingRelated = true;

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.SendMessageToCourt(subject, message, isHearingRelated);

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.viewYourMessages(subject, message, isHearingRelated);

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.viewYourMessagesInDashboard();
});

Scenario('Defendant sends message to court', async ({ I }) => {
  const subject = 'Defendant Hearing query';
  const message = 'Defendant Hearing Test message';
  const isHearingRelated = true;

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.SendMessageToCourt(subject, message, isHearingRelated);

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.viewYourMessages(subject, message, isHearingRelated);

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.viewYourMessagesInDashboard();
});
