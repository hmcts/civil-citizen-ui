const config = require('../../../../config');
const CaseProgressionSteps = require('../../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const TrialArrangementSteps = require('../../../citizenFeatures/caseProgression/steps/trialArrangementSteps');
const StringUtilsComponent = require('../../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {orderMade, uploadDocuments, otherSideTrialArrangements, confirmTrialArrangements} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {verifyNotificationTitleAndContent, verifyTasklistLinkAndState} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {uploadHearingDocuments, viewDocuments, addTrialArrangements} = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'FastTrack';
const partyType = 'LRvLiP';
let claimRef, caseData, claimNumber, taskListItem, notification, formattedCaseId, uploadDate, trialArrangementsDueDate;

Feature('Case progression journey - Upload Evidence and Trial Arrangements - Fast Track').tag('@ui-nightly-prod @ui-hearings');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
  trialArrangementsDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fourWeeksFromToday);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
  await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
  await api.triggerTrialArrangementsNotifications(config.applicantSolicitorUser, claimRef);
  await api.performTrialArrangements(config.applicantSolicitorUser, claimRef);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario.skip('Fast Track Response with RejectAll and DisputeAll - both parties upload docs and complete trial arrangements',  async ({I}) => {
  // claimant checks notifications for orders, upload docs and other party trial arrangements completed
  notification = orderMade();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  notification = otherSideTrialArrangements();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  taskListItem = uploadHearingDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
  notification = uploadDocuments('defence');
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  await I.click(notification.nextSteps);
  formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
  uploadDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(new Date());
  //defendant uploads documents
  await CaseProgressionSteps.initiateUploadEvidenceJourney(formattedCaseId, claimType, partyType, '£15,000', uploadDate);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
  taskListItem = viewDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  notification = confirmTrialArrangements(trialArrangementsDueDate);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  taskListItem = addTrialArrangements(trialArrangementsDueDate);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true, true, taskListItem.deadline);
  await I.click(notification.nextSteps);
  //defendant completes trial arrangements
  await TrialArrangementSteps.initiateTrialArrangementJourney(claimRef, claimType, formattedCaseId, '£15,000', trialArrangementsDueDate, 'Yes', partyType);
  await TrialArrangementSteps.verifyTrialArrangementsMade('Yes');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Done');
}).tag('@ui-prod');

