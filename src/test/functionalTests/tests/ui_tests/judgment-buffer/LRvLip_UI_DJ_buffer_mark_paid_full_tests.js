const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {dateTime, formattedDate} = require('../../../specClaimHelpers/api/dataHelper');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent, verifyNotificationAbsent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const applicantLR = config.applicantSolicitorUser;
const defendant = config.defendantCitizenUser;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('LR v Lip claim - Judgment Requested state - Claim marked as paid in full').tag('@ui-judgment-buffer');

Scenario('LRvLip claim marked as paid in full during buffer - CCJ cancelled, defendant paid-in-full notification (AC1, AC2) [DTSCCI-5187 #8]', async ({I, api}) => {
  const judgmentBufferEnabled = await checkToggleEnabled('judgment-buffer');
  if (!judgmentBufferEnabled) return;
  defendant.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(defendant.email, defendant.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, false, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2, dateTime(-2).slice(0, 19));
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, defendant.email);
  await api.amendApplicantSolicitor1Email(claimRef, config.systemUpdate2, applicantLR.email);

  await api.defaultJudgmentSpec(config.applicantSolicitorUser, judgmentBufferEnabled);
  await api.waitForFinishedBusinessProcess();

  const before = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.exists(before.activeJudgment, 'activeJudgment should exist while in the buffer');

  // the claimant solicitor marks the claim as paid in full while the CCJ is still pending
  await api.settleClaim(applicantLR);
  await api.waitForFinishedBusinessProcess();

  // AC1/AC2 - the requested CCJ is cancelled and the active judgment is cleared
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const paidInFullNotice = dashboardNotifications.settleClaimMarkPaidInFullDefendant(formattedDate());
  const ccjRequestedDefendant = dashboardNotifications.ccjRequestedBufferDefendant();

  // defendant dashboard - the paid-in-full notice is shown and the requested-CCJ notice is gone
  await LoginSteps.EnterCitizenCredentials(defendant.email, defendant.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationTitleAndContent(claimNumber, paidInFullNotice.title, paidInFullNotice.content, claimRef);
  await verifyNotificationAbsent(claimNumber, ccjRequestedDefendant.title, claimRef);
});
