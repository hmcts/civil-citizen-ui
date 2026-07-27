const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {dateTime} = require('../../../specClaimHelpers/api/dataHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const statusCell = (text) => `//tr[.//td[.//a[normalize-space()='${text}']]]/td[4]`;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

const runSchedulerUntilDismissed = async (api, attempts = 12, intervalMs = 5000) => {
  for (let i = 0; i < attempts; i++) {
    await api.triggerCaseDismissalScheduler();
    const data = await api.retrieveCaseData(config.adminUser, claimRef);
    if (!data.activeJudgment) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
};

Feature('Lip v Lip claim - Judgment Requested state - Case dismissed by claim deadline scheduler').tag('@civil-ccd-nightly');

Scenario('AC7 - claim deadline scheduler dismisses a buffer case past its claimDismissedDeadline, CCJ cancelled [DTSCCI-5106]', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, config.defendantCitizenUser.email);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  await api.setClaimDismissedDeadline(config.systemUpdate, claimRef, dateTime(-2).slice(0, 19));
  const dismissed = await runSchedulerUntilDismissed(api);
  assert.isTrue(dismissed, 'the claim deadline scheduler should dismiss the buffer case');

  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The case has been closed.', statusCell(claimNumber));
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  const ac5 = dashboardNotifications.ccjCancelledOnCaseDismissalClaimant();
  await verifyNotificationTitleAndContent(claimNumber, ac5.title, ac5.content, claimRef);
  await I.click('Cymraeg');
  const ac5Welsh = dashboardNotifications.ccjCancelledOnCaseDismissalClaimantWelsh();
  await verifyNotificationTitleAndContent(claimNumber, ac5Welsh.title, ac5Welsh.content, claimRef);
});

Scenario('AC7 negative - scheduler does not dismiss a buffer case whose claimDismissedDeadline is in the future [DTSCCI-5106]', async ({api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  await api.setClaimDismissedDeadline(config.systemUpdate, claimRef, dateTime(2).slice(0, 19));
  await api.triggerCaseDismissalScheduler();
  await api.triggerCaseDismissalScheduler();

  const data = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.exists(data.activeJudgment, 'judgment must remain - the case is not past its dismissal deadline');
  assert.equal(data.activeJudgment.state, 'PENDING_ISSUE');
});
