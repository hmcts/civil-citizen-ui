const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { otherSideTrialArrangements, confirmTrialArrangements } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { addTrialArrangements} = require('../../../specClaimHelpers/dashboardTasklistConstants');
const TrialArrangementSteps = require('../../../citizenFeatures/caseProgression/steps/trialArrangementSteps');

const claimType = 'FastTrack';
const claimAmount = '£15,000';
const partyType = 'LiPvLiP';
let caseData, claimNumber, claimRef, taskListItem, notification, fiveWeeksFromToday, trialArrangementsDueDate, formattedCaseId;

Feature('Case progression - Lip v Lip - Trial Arrangements journey - Fast Track').tag('@e2e-nightly-prod');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(5);
  trialArrangementsDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
  formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
  await api.triggerTrialArrangementsNotifications(config.defendantCitizenUser, claimRef);
  await api.performTrialArrangementsCitizen(config.defendantCitizenUser, claimRef);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
});

Scenario('Both parties complete their trial arrangements - Fast Track', async ({I}) => {
  // claimant checks notifications other party trial arrangements completed and complete your trial arrangements
  notification = otherSideTrialArrangements();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  notification = confirmTrialArrangements(trialArrangementsDueDate);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  taskListItem = addTrialArrangements(trialArrangementsDueDate);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true, true, taskListItem.deadline);
  await I.click(notification.nextSteps);
  //claimant starts trial arrangements
  await TrialArrangementSteps.initiateTrialArrangementJourney(claimRef, claimType, formattedCaseId, claimAmount, trialArrangementsDueDate, 'No', partyType);
  await TrialArrangementSteps.verifyTrialArrangementsMade('No');
  await I.click(claimNumber);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done');
  //defendant checks for the other party trial arrangements completed notification
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  notification = otherSideTrialArrangements();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done');
});
