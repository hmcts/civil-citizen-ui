const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const createGAAppSteps = require('../../citizenFeatures/response/steps/createGAAppSteps');
// eslint-disable-next-line no-unused-vars

let claimRef, claimType, caseData, claimNumber;

Feature('Response with PartAdmit-PayImmediately - Small Claims & Fast Track');

Scenario('Response with PartAdmit-PayImmediately Fast Track @citizenUI @partAdmit @nightly - @api @ga', async ({I, api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.assignToLipDefendant(claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.waitForFinishedBusinessProcess();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGAAppSteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGAAppSteps.askToVaryAJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGAAppSteps.askCourtToSettleByConsentGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');
});
