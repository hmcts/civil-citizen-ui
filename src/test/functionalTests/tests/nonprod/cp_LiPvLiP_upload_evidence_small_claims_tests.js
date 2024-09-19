const config = require('../../../config');
const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {DateUtilsComponent} = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {orderMade, uploadDocuments} = require('../../specClaimHelpers/dashboardNotificationConstants');
const {verifyNotificationTitleAndContent, verifyTasklistLinkAndState} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {uploadHearingDocuments, viewDocuments} = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
const partyType = 'LiPvLiP';
let claimRef,caseData, claimNumber, taskListItem, notification, formattedCaseId, uploadDate;

Feature('Case progression journey - Claimant Lip Upload Evidence - Small Claims');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('Citizen Claimant perform evidence upload',  async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled(claimRef);
    if (isDashboardServiceEnabled) {
      notification = orderMade();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      taskListItem = uploadHearingDocuments();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
      notification = uploadDocuments();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
    formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
    uploadDate = DateUtilsComponent.formatDateToSpecifiedDateFormat(new Date());
    await CaseProgressionSteps.initiateUploadEvidenceJourney(formattedCaseId, claimType, partyType, '£1,500', uploadDate);
    if (isDashboardServiceEnabled) {
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
      taskListItem = viewDocuments();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    }
  }
}).tag('@regression-cp');

