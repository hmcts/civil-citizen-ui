const config = require('../../../config');
const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {orderMade, uploadDocuments} = require('../../specClaimHelpers/dashboardNotificationConstants');
const {verifyNotificationTitleAndContent, verifyTasklistLinkAndState} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {uploadHearingDocuments, viewDocuments} = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
const partyType = 'LRvLiP';
let claimRef, caseData, claimNumber, taskListItem, notification, formattedCaseId, uploadDate;

Feature('Case progression journey - Upload Evidence - Small Claims').tag('@nightly-regression-cp');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'SMALL_CLAIM');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
  await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Small Claims Response with RejectAll and DisputeAll - both parties upload docs',  async ({I}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled(claimRef);
  if (isDashboardServiceEnabled) {
    // claimant checks notifications for orders and upload docs
    notification = orderMade();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = uploadHearingDocuments();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
    notification = uploadDocuments('defence');
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await I.click(notification.nextSteps);
  }
  formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
  uploadDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(new Date());
  //defendant uploads documents
  await CaseProgressionSteps.initiateUploadEvidenceJourney(formattedCaseId, claimType, partyType, '£1,500', uploadDate);
  if (isDashboardServiceEnabled) {
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
    taskListItem = viewDocuments();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  }
});
