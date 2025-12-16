const config = require('../../../../config');
const CaseProgressionSteps = require('../../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyTasklistLinkAndState, verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {viewTheBundle} = require('../../../specClaimHelpers/dashboardTasklistConstants');
const {bundleReady} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const  ViewBundle = require('../../../citizenFeatures/caseProgression/pages/viewBundle');

const claimType = 'FastTrack';
const partyType = 'LiPvLiP';
const claimAmount = '£15,000.00';
const viewBundlePage = new ViewBundle();
let caseData, claimNumber, claimRef, taskListItem, notification, formattedCaseId, uploadDate;

Feature('Case progression journey - Verify Bundle - Fast Track').tag('@e2e-nightly-prod');

Before(async ({api}) => {
  if (['demo', 'aat'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const twoWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(2);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef,'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(twoWeeksFromToday));
    await api.performEvidenceUploadCitizen(config.defendantCitizenUser, claimRef, claimType);
    await api.performBundleGeneration(config.hearingCenterAdminWithRegionId2, claimRef);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('Case progression journey - Fast Track - Verify Bundles tab', async ({I, api}) => {
  if (['demo', 'aat'].includes(config.runningEnv)) {
    formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
    uploadDate = DateUtilsComponent.DateUtilsComponent.formatDateToDDMMYYYY(new Date());
    //verify as claimant
    notification = bundleReady();
    await api.waitForFinishedBusinessProcess();
    await I.wait(10);
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = viewTheBundle();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    I.click(taskListItem.title);
    viewBundlePage.verifyPageContent(formattedCaseId, claimAmount, uploadDate, partyType);
    //verify as defendant
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    I.click(taskListItem.title);
    viewBundlePage.verifyPageContent(formattedCaseId, claimAmount, uploadDate, partyType);
  }
});
