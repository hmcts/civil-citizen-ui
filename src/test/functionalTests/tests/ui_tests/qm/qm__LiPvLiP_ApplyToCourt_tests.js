const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Apply to Court scenarios').tag('@ui-nightly-prod @ui-qm');

BeforeSuite(async ({ api }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
});

Scenario('01 Claimant verify Court Update Options flow', async ({ I }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.verifyCourtUpdateOptionsFlow();
});

Scenario('02 Claimant verify Send an Update to the court Options flow', async ({ I }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.verifySendUpdateToCourtFlow();
});

Scenario('03 Defendant Send documents to the court flow', async ({ I }) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.sendDocuments();
});

Scenario('04 Applicant Solve a problem to the court flow', async ({ I }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.solveProblem();
});

Scenario('05 Applicant Manage your hearing flow', async ({ I }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.manageYourHearing();
});

Scenario('06 Defendant Get support flow', async ({ I }) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.getSupport('Defendant Support query', 'Defendant Support  Test message', false);
});
