const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { claimStruckOut } = require('../../specClaimHelpers/dashboardNotificationConstants');
const { uploadHearingDocuments } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, taskListItem;

Feature('Case progression - Lip v Lip - Case Struck Out journey - Fast Track');

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
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.performCaseHearingFeeUnpaid(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Small Claims LiPvLiP case is struck out due to hearing fee not being paid', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      //Claimant verifies dashboard
      await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
      const notification = claimStruckOut();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
      taskListItem = uploadHearingDocuments();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
      //Defendant verifies dashboard
      await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
      taskListItem = uploadHearingDocuments();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
    }
  }
}).tag('@nightly-regression-cp');

