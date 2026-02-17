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

Feature('LipvLip Applicant GA creation e2e tests - Make an Order').tag('@civil-citizen-nightly @ui-ga');

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

Scenario('LipvLip Applicant GA creation e2e tests - Make an Order', async ({
  I,
  api,
}) => {
  courtResponseType = 'approveOrEdit';
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating more time to do order GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  gaID = await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  //defendant response
  console.log('Responding to the GA as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  await respondGASteps.respondToGA(claimRef, gaID, 'Respond to an application to more time to do what is required by a court order', 'Miss Jane Doe v Sir John Doe');

  await api.makeOrderGA(gaID, courtResponseType);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const orderMadeGANotif = orderMadeGA();
  await verifyNotificationTitleAndContent(claimNumber, orderMadeGANotif.title, orderMadeGANotif.content);
  await I.click(orderMadeGANotif.nextSteps);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  await verifyNotificationTitleAndContent(claimNumber, orderMadeGANotif.title, orderMadeGANotif.content);
  await I.click(orderMadeGANotif.nextSteps);
  //await I.amOnPage(`/case/${gaID}/general-application/summary`);
});