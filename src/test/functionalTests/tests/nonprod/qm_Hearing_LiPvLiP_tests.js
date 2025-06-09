const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');

const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Claimant and Defendant Journey - Hearing @qm');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Claimant Send message to court', async ({api, I}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  console.log('LIP vs LIP QM claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  console.log('claim number', claimNumber);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.SendMessageToCourt('Claimant Hearing query', 'Claimant Hearing Test message', true);
  await ResponseSteps.viewYourMessages('Claimant Hearing query', 'Claimant Hearing Test message', true);
}).tag('@qm').tag('@nightly');

Scenario('Defendant Send message to court', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.SendMessageToCourt('Defendant Hearing query', 'Defendant Hearing Test message', true);
  await ResponseSteps.viewYourMessages('Defendant Hearing query', 'Defendant Hearing Test message', true);
}).tag('@qm').tag('@nightly');
