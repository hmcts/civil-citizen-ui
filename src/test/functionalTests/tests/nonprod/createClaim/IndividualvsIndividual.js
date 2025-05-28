const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {isDashboardServiceToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  hwfSubmission,
  updateHWFNum,
  hwfMoreInfoRequired,
  hwfFullRemission,
  waitForDefendantToRespond,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData, legacyCaseReference, caseRef, claimNumber, claimInterestFlag, StandardInterest, selectedHWF,
  claimAmount = 1600, claimFee = 115;

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Individual vs Individual').tag('@create-claim @regression-r2 @api-drr');

Scenario('Create Claim -  Individual vs Individual - small claims - with variable interest - with hwf', async ({api}) => {
  selectedHWF = true;
  claimInterestFlag = true;
  StandardInterest = false;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = hwfSubmission();
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
  }
  await api.submitHwfEventForUser(config.hwfEvents.updateHWFNumber);
  if (isDashboardServiceEnabled) {
    const notification = updateHWFNum();
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
  }
  await api.submitHwfEventForUser(config.hwfEvents.moreInfoHWF);
  if (isDashboardServiceEnabled) {
    const notification = hwfMoreInfoRequired();
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
  }
  await api.submitHwfEventForUser(config.hwfEvents.fullRemission);
  if (isDashboardServiceEnabled) {
    const notification = hwfFullRemission(claimFee);
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
  }
  await api.submitHwfEventForUser(config.hwfEvents.feePayOutcome);
  if (isDashboardServiceEnabled) {
    const notification = await waitForDefendantToRespond();
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
  }
});
