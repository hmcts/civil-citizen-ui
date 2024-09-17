const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const HearingFeeSteps = require('../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { hearingScheduled, payTheHearingFeeClaimant, hearingFeePaidFull } = require('../../specClaimHelpers/dashboardNotificationConstants');
const { viewHearings, payTheHearingFee } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'FastTrack';
const claimAmount = '£15,000';
const feeAmount = '545';
let caseData, claimNumber, claimRef, taskListItem, notification, fiveWeeksFromToday, hearingFeeDueDate, hearingDate;

Feature('Case progression - Lip v Lip - Hearing Fee journey - Fast Track');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(5);
    hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
    hearingDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(fiveWeeksFromToday);
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
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('Apply for Help with Fees Journey - Fast Track', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      notification = hearingScheduled(hearingDate);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
      await ResponseSteps.SignOut();
      await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
      await I.click(claimNumber);
      await I.dontSee(notification.title);
      notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      taskListItem = viewHearings();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
      taskListItem = payTheHearingFee(hearingFeeDueDate);
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true, true, taskListItem.deadline);
      await I.click(notification.nextSteps2);
    }
    await HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, feeAmount, hearingFeeDueDate, claimRef, claimAmount);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceEnabled) {
      taskListItem = payTheHearingFee(hearingFeeDueDate);
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', false, true, taskListItem.deadline);
    }
  }
}).tag('@regression-cp');

Scenario('Pay the Hearing Fee Journey - Fast Track',  async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
    await HearingFeeSteps.payHearingFeeJourney(claimRef, feeAmount, hearingFeeDueDate);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceEnabled) {
      taskListItem = payTheHearingFee(hearingFeeDueDate);
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done', false, false);
      notification = hearingFeePaidFull();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    }
  }
}).tag('@regression-cp');
