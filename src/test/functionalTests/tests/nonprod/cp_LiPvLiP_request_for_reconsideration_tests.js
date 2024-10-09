const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const HearingFeeSteps = require('../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { hearingScheduled, payTheHearingFeeClaimant, hearingFeePaidFull} = require('../../specClaimHelpers/dashboardNotificationConstants');
const { viewHearings, payTheHearingFee } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaimsThousand';
const claimAmount = '£1,500';
const feeAmount = '123';
let caseData, claimNumber, claimRef, taskListItem, notification, fiveWeeksFromToday, hearingFeeDueDate, hearingDate, formattedCaseId;

Feature('Case progression - Lip v Lip - Request for reconsideration');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.legalAdvisor, claimRef, 'smallClaimsTrack');
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Claimant performs Request for reconsideration and Defendant adds a comment', async ({I, api}) => {
  // if (['preview', 'demo'].includes(config.runningEnv)) {
  //   await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  //   const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  //   if (isDashboardServiceEnabled) {
  //     notification = hearingScheduled(hearingDate);
  //     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  //     await I.click(notification.nextSteps);
  //     await ResponseSteps.SignOut();
  //     await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  //     await I.click(claimNumber);
  //     await I.dontSee(notification.title);
  //     notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
  //     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  //     taskListItem = viewHearings();
  //     await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  //     taskListItem = payTheHearingFee(hearingFeeDueDate);
  //     await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true, true, taskListItem.deadline);
  //     await I.click(notification.nextSteps2);
  //   }
  //   formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
  //   await HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, feeAmount, hearingFeeDueDate, formattedCaseId, claimAmount);
  //   await api.waitForFinishedBusinessProcess();
  //
  // }
}).tag('@regression-cp');

// Scenario('Pay the Hearing Fee Journey - Small Claims', async ({I, api}) => {
//   if (['preview', 'demo'].includes(config.runningEnv)) {
//     const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
//     if (isDashboardServiceEnabled) {
//       notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
//       await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//       await I.click(notification.nextSteps);
//     }
//     await HearingFeeSteps.payHearingFeeJourney(claimRef, feeAmount, hearingFeeDueDate);
//     await api.waitForFinishedBusinessProcess();
//     if (isDashboardServiceEnabled) {
//       taskListItem = payTheHearingFee(hearingFeeDueDate);
//       await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done', false, false);
//       notification = hearingFeePaidFull();
//       await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//     }
//   }
// }).tag('@regression-cp');
