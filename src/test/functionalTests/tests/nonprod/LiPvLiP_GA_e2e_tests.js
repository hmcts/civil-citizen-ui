const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const createGASteps = require('../../citizenFeatures/GA/steps/createGASteps');
const respondGASteps = require('../../citizenFeatures/GA/steps/respondGASteps');
// eslint-disable-next-line no-unused-vars
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {orderMadeGA, payAdditionalApplicationFeeGA, applicationBeingProcessedGA, otherPartiesRequestedChange, writtenRepresentations } = require('../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType, caseData, claimNumber, gaID, courtResponseType;

Feature('Lip v Lip GA e2e Tests');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

    claimType = 'FastTrack';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await api.assignToLipDefendant(claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('LipvLip Applicant GA creation e2e tests - Make an Order @citizenUI - @api @ga @regression', async ({
  I,
  api,
}) => {
  courtResponseType = 'approveOrEdit';
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = orderMadeGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }

    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = orderMadeGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
    //await I.amOnPage(`/case/${gaID}/general-application/summary`);

  }
});

Scenario('LipvLip Applicant GA creation e2e tests - Dismiss an Order @citizenUI - @api @ga @nightly', async ({
  I,
  api,
}) => {
  courtResponseType = 'dismissAnOrder';
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

    console.log('Creating an Adjourn Hearing Order GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

    await api.makeOrderGA(gaID, courtResponseType);

    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = orderMadeGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
  }
});

Scenario('LipvLip Applicant GA creation e2e tests - Give directions without listing @citizenUI - @api @ga @nightly', async ({
  I,
  api,
}) => {
  courtResponseType = 'giveDirections';
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

    console.log('Creating an Adjourn Hearing Order GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

    await api.makeOrderGA(gaID, courtResponseType);

    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = orderMadeGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
  }
});

Scenario('LipvLip Applicant GA creation e2e tests - Give directions without listing @citizenUI - @api @ga @nightly', async ({
  I,
  api,
}) => {
  courtResponseType = 'freeFormOrder';
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    console.log('Creating an Adjourn Hearing Order GA app as Defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

    await api.makeOrderGA(gaID, courtResponseType);

    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = orderMadeGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
  }
});

Scenario('LipvLip Applicant GA creation e2e tests - without notice to with notice @citizenUI - @api @ga @nightly', async ({
  I,
  api,
}) => {
  courtResponseType = 'withoutNoticeToWith';
  let feeAmount = 184;
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    console.log('Creating an Adjourn Hearing Order GA app as Defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

    await api.makeOrderGA(gaID, courtResponseType);

    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = payAdditionalApplicationFeeGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }

    await I.amOnPage('/case/'+claimRef+'/general-application/'+gaID+'/pay-additional-fee');
    // await I.click('Response from the court');
    // await I.click('Pay the additional fee');
    await I.click('Make the payment');
    await createGASteps.additionalPayment(feeAmount);

    if (isDashboardServiceEnabled) {
      const notification = applicationBeingProcessedGA();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = otherPartiesRequestedChange();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
  }
});

Scenario('LipvLip Applicant GA creation e2e tests - Order for Written Representations @citizenUI - @api @ga @nightly', async ({
  I,
  api,
}) => {
  courtResponseType = 'writtenRepresentations';
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = writtenRepresentations();
      await I.wait(10);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }

    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    if (isDashboardServiceEnabled) {
      const notification = writtenRepresentations();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
  }
});
