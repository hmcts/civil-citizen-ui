const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../specClaimHelpers/e2e/dashboardHelper');
const {caseOffline, caseOfflineAfterSDO} = require('../../specClaimHelpers/dashboardNotificationConstants');
const testTimeHelper = require('../../helpers/test_time_helper');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, notification;

Feature('Lip v Lip - Case Offline Tests').tag('@case-offline');

// Before(async ({api}) => {
//   await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
//   caseData = await api.retrieveCaseData(config.adminUser, claimRef);
//   claimNumber = await caseData.legacyCaseReference;
//   await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
//   await api.waitForFinishedBusinessProcess();
//   notification = caseOffline();
// });

Scenario('Lip v Lip Case is offline after caseworker performs Case proceeds in caseman event', async ({api}) => {
  await testTimeHelper.addTestStartTime('Lip v Lip Case is offline after caseworker performs Case proceeds in caseman event');
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  notification = caseOffline();

  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();

  if (isDashboardServiceEnabled) {
    await api.caseProceedsInCaseman();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  }
  await testTimeHelper.addTestEndTime('Lip v Lip Case is offline after caseworker performs Case proceeds in caseman event');
}).tag('@regression');

Scenario('Lip v Lip Case is offline after solicitor performs notice of change on behalf of defendant', async ({noc, api}) => {
  await testTimeHelper.addTestStartTime('Lip v Lip Case is offline after solicitor performs notice of change on behalf of defendant');
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  notification = caseOffline();
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  // After Noc for full defence case remains online
  // onlineNotification = caseOnline();
  if (isDashboardServiceEnabled) {
    await noc.requestNoticeOfChangeForLipRespondent(claimRef, config.applicantSolicitorUser);
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    // await verifyNotificationTitleAndContent(claimNumber, onlineNotification.title, onlineNotification.content, claimRef);
  }
  await testTimeHelper.addTestEndTime('Lip v Lip Case is offline after solicitor performs notice of change on behalf of defendant');
}).tag('@noc @regression');

Scenario('Lip v Lip Case is taken offline after SDO for non early adopters', async ({api}) => {
  await testTimeHelper.addTestStartTime('Lip v Lip Case is taken offline after SDO for non early adopters');
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  notification = caseOffline();
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    notification = caseOfflineAfterSDO();
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'IN_MEDIATION', '', false);
    await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'smallClaimsTrack');
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await api.caseProceedsInCaseman();
  }
  await testTimeHelper.addTestEndTime('Lip v Lip Case is taken offline after SDO for non early adopters');
}).tag('@case-progression @regression');
