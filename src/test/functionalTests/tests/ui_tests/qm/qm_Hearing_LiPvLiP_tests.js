const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Claimant and Defendant Journey - Hearing').tag('@civil-citizen-nightly @ui-qm');

BeforeSuite(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Claimant and defendant can send hearing-related messages to the court', async ({ api, I }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  console.log('LIP vs LIP QM claim created:', claimRef);

  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  console.log('Claim number:', claimNumber);

  const claimantSubject = 'Claimant Hearing query';
  const claimantMessage = 'Claimant Hearing Test message';
  const defendantSubject = 'Defendant Hearing query';
  const defendantMessage = 'Defendant Hearing Test message';
  const isHearingRelated = true;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.SendMessageToCourt(claimantSubject, claimantMessage, isHearingRelated);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.SendMessageToCourt(defendantSubject, defendantMessage, isHearingRelated);
});
