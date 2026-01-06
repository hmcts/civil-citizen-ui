const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const respondGASteps = require('../../../citizenFeatures/GA/steps/respondGASteps');
// eslint-disable-next-line no-unused-vars
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  writtenRepresentations,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType, caseData, claimNumber, gaID, courtResponseType;

Feature('LipvLip Applicant GA creation e2e tests - Order for Written Representations').tag('@ui-nightly-prod @ui-ga');

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

Scenario('LipvLip Applicant GA creation e2e tests - Order for Written Representations', async ({
  I,
  api,
}) => {
  courtResponseType = 'writtenRepresentations';
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating an Adjourn Hearing Order GA app as Claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  console.log('Responding to the GA as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await respondGASteps.respondToGA(claimRef, gaID, 'Respond to an application to change a hearing date', 'Miss Jane Doe v Sir John Doe');

  console.log('Request written representations as the Judge');
  await api.makeOrderGA(gaID, courtResponseType);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const writtenRepresentationsNotif = writtenRepresentations();
  await I.wait(10);
  await verifyNotificationTitleAndContent(claimNumber, writtenRepresentationsNotif.title, writtenRepresentationsNotif.content);
  await I.click(writtenRepresentationsNotif.nextSteps);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  await verifyNotificationTitleAndContent(claimNumber, writtenRepresentationsNotif.title, writtenRepresentationsNotif.content);
  await I.click(writtenRepresentationsNotif.nextSteps);
});
