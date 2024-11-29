const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { caseOffline } = require('../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, notification;

Feature('Case progression - Lip v Lip - Case Struck Out journey - Fast Track');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Case is offline after caseworker performs Case proceeds in caseman event', async ({api, I}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    // await api.caseProceedsInCaseman();
    // await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    // notification = caseOffline();
    // await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    // await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    // await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  }
}).tag('@regression');

Scenario('Case is offline after caseworker performs Take case offline event', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
    }
  }
}).tag('@nightly-regression-cp');

Scenario('Case is offline after solicitor performs notice of change on behalf of defendant', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
    }
  }
}).tag('@nightly-regression-cp');

Scenario('Case is offline after claimant response deadline is passed', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
    }
  }
}).tag('@nightly-regression-cp');

Scenario('Case is taken offline after SDO for non early adopters', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
    }
  }
}).tag('@nightly-regression-cp');
