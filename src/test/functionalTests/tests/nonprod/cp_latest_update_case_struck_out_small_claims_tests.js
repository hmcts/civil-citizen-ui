const config = require('../../../config');
const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { claimStruckOut } = require('../../specClaimHelpers/dashboardNotificationConstants');
const { addTrialArrangements, uploadHearingDocuments } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, taskListItem;

Feature('Case progression - Case Struck Out journey - Small Claims');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'SMALL_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.performCaseHearingFeeUnpaid(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Small claims case is struck out due to hearing fee not being paid', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    if (['preview', 'demo'].includes(config.runningEnv)) {
      const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
      if (isDashboardServiceEnabled) {
        const notification = claimStruckOut();
        await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
        taskListItem = addTrialArrangements();
        await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locatorSmallClaim, 'INACTIVE');
        taskListItem = uploadHearingDocuments();
        await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locatorSmallClaim, 'INACTIVE');
      } else {
        CaseProgressionSteps.verifyLatestUpdatePageForCaseStruckOut(claimRef, claimType);
      }
    }
  }
}).tag('@regression-cp');

