const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../specClaimHelpers/e2e/dashboardHelper');
const {caseOffline, caseOfflineAfterSDO} = require('../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, notification;

Feature('Lip v Lip - Case Offline Tests');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  notification = caseOffline();
});

Scenario('Case is offline after caseworker performs Case proceeds in caseman event', async ({api}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

  if (isDashboardServiceEnabled) {
    await api.caseProceedsInCaseman();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  }
}).tag('@regression');

Scenario('Case is offline after solicitor performs notice of change on behalf of defendant', async ({noc}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  // After Noc for full defence case remains online
  // onlineNotification = caseOnline();
  if (isDashboardServiceEnabled) {
    await noc.requestNoticeOfChangeForLipRespondent(claimRef, config.applicantSolicitorUser);
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    // await verifyNotificationTitleAndContent(claimNumber, onlineNotification.title, onlineNotification.content, claimRef);
  }
}).tag('@regression');

Scenario('Case is taken offline after SDO for non early adopters', async ({api}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    notification = caseOfflineAfterSDO();
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL', '', false);
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'smallClaimsTrack');
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await api.caseProceedsInCaseman();
  }
}).tag('@regression');
