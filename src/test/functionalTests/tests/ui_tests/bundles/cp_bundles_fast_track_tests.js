const config = require('../../../../config');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyTasklistLinkAndState, verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {viewTheBundle} = require('../../../specClaimHelpers/dashboardTasklistConstants');
const {bundleReady} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const  ViewBundle = require('../../../citizenFeatures/caseProgression/pages/viewBundle');

const claimType = 'FastTrack';
const partyType = 'LRvLiP';
const viewBundlePage = new ViewBundle();
let caseData, claimNumber, claimRef, taskListItem, notification, formattedCaseId, uploadDate;

Feature('Case progression journey - Verify Bundle Page - Fast Track').tag('@civil-citizen-nightly @ui-bundles');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const twoWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(2);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef,'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(twoWeeksFromToday));
  await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
  await api.performBundleGeneration(config.hearingCenterAdminWithRegionId2, claimRef);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Case progression journey - Fast Track - Verify Bundles tab', async ({I}) => {
  if (['demo', 'aat'].includes(config.runningEnv)) {
    formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
    uploadDate = DateUtilsComponent.DateUtilsComponent.formatDateToDDMMYYYY(new Date());
    notification = bundleReady();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = viewTheBundle();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    I.click(taskListItem.title);
    viewBundlePage.verifyPageContent(formattedCaseId, '£15,000.00', uploadDate, partyType);
  }
});
