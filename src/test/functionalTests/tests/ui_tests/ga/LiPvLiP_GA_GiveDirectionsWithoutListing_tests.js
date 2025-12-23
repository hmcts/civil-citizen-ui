const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const respondGASteps = require('../../../citizenFeatures/GA/steps/respondGASteps');
// eslint-disable-next-line no-unused-vars
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  orderMadeGA,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType, caseData, claimNumber, gaID, courtResponseType;

Feature('LipvLip Applicant GA creation e2e tests - Give directions without listing').tag('@ui-nightly-prod @ui-ga');

Before(async ({ api }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('LipvLip Applicant GA creation e2e tests - Give directions without listing', async ({
  I,
  api,
}) => {
  courtResponseType = 'giveDirections';
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating an Adjourn Hearing Order GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  await api.makeOrderGA(gaID, courtResponseType);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const orderMadeGANotif = orderMadeGA();
  await verifyNotificationTitleAndContent(claimNumber, orderMadeGANotif.title, orderMadeGANotif.content);
  await I.click(orderMadeGANotif.nextSteps);
});
