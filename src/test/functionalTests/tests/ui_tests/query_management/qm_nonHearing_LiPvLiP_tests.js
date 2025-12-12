const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Claimant and Defendant Journey - Non Hearing @qm').tag('@nightly-prod');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

async function loginAndOpenClaim(I, user, claimNumber) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
}

Scenario('Claimant sends non-hearing message to court', async ({ api, I }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  console.log('Non-hearing QM claim created:', claimRef);

  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  const subject = 'Claimant query';
  const message = 'Claimant Test message';
  const isHearingRelated = false;

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.SendMessageToCourt(subject, message, isHearingRelated);

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.viewYourMessages(subject, message, isHearingRelated);
});

Scenario('Defendant sends non-hearing message to court', async ({ I }) => {
  const subject = 'Defendant query';
  const message = 'Defendant Test message';
  const isHearingRelated = false;

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.SendMessageToCourt(subject, message, isHearingRelated);

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.viewYourMessages(subject, message, isHearingRelated);
});
