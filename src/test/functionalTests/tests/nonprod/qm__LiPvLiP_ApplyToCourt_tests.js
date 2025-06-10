const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Apply to Court scenarios @qm');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

async function loginAndOpenClaim(I, user, claimNumber) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
}

Scenario('Claimant verify Court Update Options Flow @123', async ({ api, I }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi', true);
  console.log('Non-hearing QM claim created:', claimRef);

  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();

  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  console.log('🧾 Claim number:', claimNumber);

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.verifyCourtUpdateOptionsFlow();
}).tag('@qm').tag('@nightly');
