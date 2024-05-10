const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
// const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
// const HearingFeeSteps = require('../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
// const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
// const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
// const { hearingScheduled, payTheHearingFeeClaimant } = require('../../specClaimHelpers/dashboardNotificationConstants');
// const { viewHearings, payTheHearingFee } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'FastTrack';
// let caseData, claimNumber, claimRef, taskListItem, notification, fiveWeeksFromToday, hearingFeeDueDate, hearingDate;
let claimRef, fiveWeeksFromToday;

Feature('Case progression - Lip v Lip - Hearing Fee journey - Fast Track');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(5);
    // hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
    // hearingDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(fiveWeeksFromToday);
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    // caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    // claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

// uncomment once CIV-13830 is released
// Scenario('Apply for Help with Fees Journey - Fast Track', async ({I}) => {
// if (['preview', 'demo'].includes(config.runningEnv)) {
//   const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
//   if (isDashboardServiceEnabled) {
//     notification = hearingScheduled(hearingDate);
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//     await I.click(notification.nextSteps);
//     await ResponseSteps.SignOut();
//     await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//     await I.click(claimNumber);
//     await I.dontSee(notification.title);
//     notification = payTheHearingFeeClaimant('545', hearingFeeDueDate);
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//     taskListItem = viewHearings();
//     await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locatorFastTrack, 'AVAILABLE', true);
//     taskListItem = payTheHearingFee(hearingFeeDueDate);
//     await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locatorFastTrack, 'ACTION NEEDED', true, true, taskListItem.deadline);
//     await I.click(notification.nextSteps2);
//     await HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, '545', hearingFeeDueDate);
//   }
// }
// }).tag('@regression-cp');

// Scenario('Pay the Hearing Fee Journey - Fast Track', () => {
//   if (['preview', 'demo'].includes(config.runningEnv)) {
//     //HearingFeeSteps.payHearingFeeJourney(claimRef, '545', hearingFeeDueDate);
//   }
// }).tag('@regression-cp');
