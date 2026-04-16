const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const HearingFeeSteps = require('../../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent, verifyTasklistLinkAndState} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {payTheHearingFeeClaimant, hearingFeePaidFull} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {payTheHearingFee} = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'FastTrack';
const feeAmount = '619';
let caseData, claimNumber, claimRef, notification, taskListItem, fiveWeeksFromToday, hearingFeeDueDate;

Feature('Lip v Lip - Hearing Fee Payment Session - DTSCCI-4177').tag('@civil-citizen-pr @civil-citizen-nightly @ui-payments');

Before(async ({api}) => {
  fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(10);
  hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
  await api.waitForFinishedBusinessProcess();
});

Scenario('LipvLip hearing fee payment end-to-end', async ({I, api}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.click(claimNumber);
  notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  await I.click(notification.nextSteps);
  await HearingFeeSteps.payHearingFeeJourney(feeAmount);
  await api.waitForFinishedBusinessProcess();
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  notification = hearingFeePaidFull();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  taskListItem = payTheHearingFee(hearingFeeDueDate);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done', false, false);
});
