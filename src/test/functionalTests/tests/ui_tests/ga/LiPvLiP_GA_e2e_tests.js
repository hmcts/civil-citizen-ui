const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const respondGASteps = require('../../../citizenFeatures/GA/steps/respondGASteps');
// eslint-disable-next-line no-unused-vars
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  orderMadeGA,
  payAdditionalApplicationFeeGA,
  applicationBeingProcessedGA,
  otherPartiesRequestedChange,
  orderMoreInformation,
  writtenRepresentations,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType, caseData, claimNumber, gaID, courtResponseType;

Feature('Lip v Lip GA e2e Tests').tag('@ui-nightly-prod @ui-ga');

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

Scenario('LipvLip Applicant GA creation e2e tests - Dismiss an Order', async ({
  I,
  api,
}) => {
  courtResponseType = 'dismissAnOrder';
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
}).tag('@ui-prod');

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

Scenario('LipvLip Applicant GA creation e2e tests - Free Form Order', async ({
  I,
  api,
}) => {
  courtResponseType = 'freeFormOrder';
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  console.log('Creating an Adjourn Hearing Order GA app as Defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  await api.makeOrderGA(gaID, courtResponseType);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const orderMadeGANotif = orderMadeGA();
  await verifyNotificationTitleAndContent(claimNumber, orderMadeGANotif.title, orderMadeGANotif.content);
  await I.click(orderMadeGANotif.nextSteps);
});

Scenario('LipvLip Applicant GA creation e2e tests - without notice to with notice', async ({
  I,
  api,
}) => {
  courtResponseType = 'withoutNoticeToWith';
  let feeAmount = 184;
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  console.log('Creating an Adjourn Hearing Order GA app as Defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  await api.makeOrderGA(gaID, courtResponseType);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const payAdditionalApplicationFeeGANotif = payAdditionalApplicationFeeGA();
  await verifyNotificationTitleAndContent(claimNumber, payAdditionalApplicationFeeGANotif.title, payAdditionalApplicationFeeGANotif.content);
  await I.click(payAdditionalApplicationFeeGANotif.nextSteps);

  await I.amOnPage('/case/' + claimRef + '/general-application/' + gaID + '/pay-additional-fee');
  // await I.click('Response from the court');
  // await I.click('Pay the additional fee');
  await I.click('Make the payment');
  await createGASteps.additionalPayment(feeAmount);

  const applicationBeingProcessedGANotif = applicationBeingProcessedGA();
  await verifyNotificationTitleAndContent(claimNumber, applicationBeingProcessedGANotif.title, applicationBeingProcessedGANotif.content);
  await I.click(applicationBeingProcessedGANotif.nextSteps);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const otherPartiesRequestedChangeNotif = otherPartiesRequestedChange();
  await verifyNotificationTitleAndContent(claimNumber, otherPartiesRequestedChangeNotif.title, otherPartiesRequestedChangeNotif.content);
  await I.click(otherPartiesRequestedChangeNotif.nextSteps);
});

Scenario('LipvLip Applicant GA creation e2e tests - Request for more info', async ({
  I,
  api,
}) => {
  courtResponseType = 'requestMoreInformation';
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

  console.log('Request more information as the Judge');
  await api.makeOrderGA(gaID, courtResponseType);

  const orderMoreInformationNotif = orderMoreInformation();
  await I.wait(10);
  await verifyNotificationTitleAndContent(claimNumber, orderMoreInformationNotif.title, orderMoreInformationNotif.content);
  await I.click(orderMoreInformationNotif.nextSteps);
});

Scenario('LipvLip Applicant GA creation e2e tests - List for hearing', async ({
  I,
  api,
}) => {
  courtResponseType = 'listForHearing';
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

  console.log('Perform List for hearing as the Judge');
  await api.makeOrderGA(gaID, courtResponseType);

  const orderMadeGANotif = orderMadeGA();
  await I.wait(10);
  await verifyNotificationTitleAndContent(claimNumber, orderMadeGANotif.title, orderMadeGANotif.content);
  await I.click(orderMadeGANotif.nextSteps);
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