const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');

let caseData, claimNumber, claimRef;

Feature('Lip v Lip - Multiple GA Payments on Same Claim - DTSCCI-4177').tag('@civil-citizen-nightly @ui-payments');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'FastTrack');
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Claimant raises two GA applications on the same claim and completes payment for both', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');
  await createGASteps.askToVaryAJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');
});
