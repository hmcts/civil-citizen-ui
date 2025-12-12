const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

async function claimSetup(api) {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
}

async function loginAndSelectClaim({ I, user }) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
}

Feature('QM - LIP - Apply to Court scenarios').tag('@nightly-prod @qm');

BeforeSuite(async ({ api, I }) => {
  await claimSetup(api, I);
});

Scenario('Claimant verify Court Update Options flow', async ({ I }) => {
  await loginAndSelectClaim({ I, user: config.claimantCitizenUser });
  await ResponseSteps.verifyCourtUpdateOptionsFlow();
});

Scenario('Claimant verify Send an Update to the court Options flow', async ({ I }) => {
  await loginAndSelectClaim({ I, user: config.claimantCitizenUser });
  await ResponseSteps.verifySendUpdateToCourtFlow();
});

Scenario('Defendant Send documents to the court flow', async ({ I }) => {
  await loginAndSelectClaim({ I, user: config.defendantCitizenUser });
  await ResponseSteps.sendDocuments();
});

Scenario('Applicant Solve a problem to the court flow', async ({ I }) => {
  await loginAndSelectClaim({ I, user: config.claimantCitizenUser });
  await ResponseSteps.solveProblem();
});

Scenario('Applicant Manage your hearing flow', async ({ I }) => {
  await loginAndSelectClaim({ I, user: config.claimantCitizenUser });
  await ResponseSteps.manageYourHearing();
});

Scenario('Defendant Get support flow', async ({ I }) => {
  await loginAndSelectClaim({ I, user: config.defendantCitizenUser });
  await ResponseSteps.getSupport('Defendant Support query', 'Defendant Support  Test message', false);
});
