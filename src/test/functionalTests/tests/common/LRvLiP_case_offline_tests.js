const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { caseOffline, caseOfflineAfterSDO } = require('../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, notification;

Feature('Case progression - Lip v Lip - Case Struck Out journey - Fast Track');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  notification = caseOffline();
});

Scenario('Case is offline after caseworker performs Case proceeds in caseman event', async ({api, I}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    await api.caseProceedsInCaseman();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  }
}).tag('@regression');

Scenario('Case is taken offline after SDO for non early adopters', async ({api}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    notification = caseOfflineAfterSDO();
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'SMALL_CLAIM', false);
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'smallClaimsTrack');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.claimantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await api.caseProceedsInCaseman();
  }
}).tag('@regression');
