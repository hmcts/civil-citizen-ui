const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');

async function setupClaimAndLogin({ api, I, userType = 'claimant', flowType = 'courtUpdate' }) {
  const user = userType === 'claimant' ? config.claimantCitizenUser : config.defendantCitizenUser;
  await createAccount(user.email, user.password);

  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);

  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;

  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  return { claimRef, caseData, claimNumber };
}

Feature('QM - LIP - Apply to Court scenarios @qm @123');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Claimant verify Court Update Options flow', async ({ api, I }) => {
  await setupClaimAndLogin({ api, I, userType: 'claimant', flowType: 'courtUpdate' });
  await ResponseSteps.verifyCourtUpdateOptionsFlow();
}).tag('@qm').tag('@nightly');

Scenario('Claimant verify Send an Update to the court Options flow', async ({ api, I }) => {
  await setupClaimAndLogin({ api, I, userType: 'claimant', flowType: 'sendUpdate' });
  await ResponseSteps.verifySendUpdateToCourtFlow();
}).tag('@qm').tag('@nightly');

Scenario('Defendant Send documents to the court flow', async ({ api, I }) => {
  await setupClaimAndLogin({ api, I, userType: 'defendant', flowType: 'sendDocuments' });
  await ResponseSteps.sendDocuments();
}).tag('@qm').tag('@nightly');
