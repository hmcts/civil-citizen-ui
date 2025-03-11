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

const claimType = 'SmallClaims';
const claimAmount = '£1,500';
const feeAmount = '123';
let caseData, claimNumber, claimRef, taskListItem, notification, fiveWeeksFromToday, hearingFeeDueDate, hearingDate, formattedCaseId;

Feature('Case progression - Lip v Lip - Hearing Fee journey - Small Claims');

Before(async ({api}) => {
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
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
});

Scenario('Apply for Help with Fees Journey - Small Claims', async ({I, api}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    notification = hearingScheduled(hearingDate);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await I.click(notification.nextSteps);
    await ResponseSteps.SignOut();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.click(claimNumber);
    await I.dontSee(notification.title);
    notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = viewHearings();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    taskListItem = payTheHearingFee(hearingFeeDueDate);
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true, true, taskListItem.deadline);
    await I.click(notification.nextSteps2);
  }
  formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
  await HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, feeAmount, hearingFeeDueDate, formattedCaseId, claimAmount);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    taskListItem = payTheHearingFee(hearingFeeDueDate);
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', false, true, taskListItem.deadline);
  }
}).tag('@regression-cp').tag('@local-testing');

Scenario('Pay the Hearing Fee Journey - Small Claims', async ({I, api}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await I.click(notification.nextSteps);
  }
  await HearingFeeSteps.payHearingFeeJourney(claimRef, feeAmount, hearingFeeDueDate);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    notification = hearingFeePaidFull();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = payTheHearingFee(hearingFeeDueDate);
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done', false, false);
  }
}).tag('@regression-cp');
