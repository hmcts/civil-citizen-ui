const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {dateTime} = require('../../../specClaimHelpers/api/dataHelper');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationAbsent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const applicantLR = config.applicantSolicitorUser;
const defendant = config.defendantCitizenUser;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('LR v Lip claim - Judgment Requested state - Caseworker settles the claim').tag('@ui-judgment-buffer');

Scenario('Caseworker settles the claim (SETTLE_CLAIM) during buffer - CCJ cancelled, requested-CCJ notice removed [DTSCCI-5187 #7]', async ({I, api}) => {
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

  // a caseworker settles the claim (SETTLE_CLAIM, distinct from LIP_CLAIM_SETTLED and
  // SETTLE_CLAIM_MARK_PAID_FULL) while the CCJ is still pending
  await api.settleClaimCaseworker(config.ctscAdmin, claimRef);
  await api.waitForFinishedBusinessProcess();

  // AC1 - the requested CCJ is cancelled and the active judgment is cleared
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const ccjRequestedDefendant = dashboardNotifications.ccjRequestedBufferDefendant();

  // defendant dashboard - the requested-CCJ notice is gone
  await LoginSteps.EnterCitizenCredentials(defendant.email, defendant.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationAbsent(claimNumber, ccjRequestedDefendant.title, claimRef);
});
