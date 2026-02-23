const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Claimant and Defendant Journey - Non Hearing').tag('@civil-citizen-nightly @ui-qm');

BeforeSuite(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('01 Claimant sends non-hearing message to court', async ({ api, I }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  console.log('Non-hearing QM claim created:', claimRef);

  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;

  const subject = 'Claimant query';
  const message = 'Claimant Test message';
  const isHearingRelated = false;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.SendMessageToCourt(subject, message, isHearingRelated);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.viewYourMessages(subject, message, isHearingRelated);
});

Scenario('02 Defendant sends non-hearing message to court', async ({ I }) => {
  const subject = 'Defendant query';
  const message = 'Defendant Test message';
  const isHearingRelated = false;

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.SendMessageToCourt(subject, message, isHearingRelated);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.viewYourMessages(subject, message, isHearingRelated);
});
