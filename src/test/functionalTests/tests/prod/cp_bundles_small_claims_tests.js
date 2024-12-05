const config = require('../../../config');
const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { verifyTasklistLinkAndState, verifyNotificationTitleAndContent } = require('../../specClaimHelpers/e2e/dashboardHelper');
const {viewTheBundle} = require('../../specClaimHelpers/dashboardTasklistConstants');
const {bundleReady} = require('../../specClaimHelpers/dashboardNotificationConstants');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const  ViewBundle = require('../../citizenFeatures/caseProgression/pages/viewBundle');

const claimType = 'SmallClaims';
const partyType = 'LRvLiP';
const viewBundlePage = new ViewBundle();
let caseData, claimNumber, claimRef, taskListItem, notification, formattedCaseId, uploadDate;

Feature('Case progression journey - Verify Bundle Page - Small Claims');

Before(async ({api}) => {
  if (['demo', 'aat'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const twoWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(2);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'SMALL_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'smallClaimsTrack');
    await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(twoWeeksFromToday));
    await api.performBundleGeneration(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Case progression journey - Small Claims - Verify Bundles Page', async ({I}) => {
  if (['demo', 'aat'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled(claimRef);
    if (isDashboardServiceEnabled) {
      formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
      uploadDate = DateUtilsComponent.DateUtilsComponent.formatDateToDDMMYYYY(new Date());
      notification = bundleReady();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
      taskListItem = viewTheBundle();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
      I.click(taskListItem.title);
      viewBundlePage.verifyPageContent(formattedCaseId, '£1,500', uploadDate, partyType);
    } else {
      CaseProgressionSteps.verifyBundle(claimRef, claimType);
    }
  }
}).tag('@nightly-regression-cp');
