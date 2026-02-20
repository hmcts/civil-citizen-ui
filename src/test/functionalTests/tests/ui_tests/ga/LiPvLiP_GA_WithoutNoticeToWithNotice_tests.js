const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
// eslint-disable-next-line no-unused-vars
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payAdditionalApplicationFeeGA,
  applicationBeingProcessedGA,
  otherPartiesRequestedChange,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType, caseData, claimNumber, gaID, courtResponseType;

Feature('LipvLip Applicant GA creation e2e tests - without notice to with notice').tag('@civil-citizen-nightly @ui-ga');

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
