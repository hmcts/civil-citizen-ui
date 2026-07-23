const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent, verifyNotificationAbsent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const ccjRequestedTitle = 'The CCJ has been requested';
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('Lip v Lip claim - Judgment Requested state - Case settled').tag('@ui-judgment-buffer');

Scenario('Case settled during JUDGMENT_REQUESTED buffer - CCJ cancelled, claimant + defendant notifications and defendant email (AC1-AC6) [DTSCCI-5108]', async ({I, api}) => {
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

  await api.settleClaimLip(config.claimantCitizenUser);

  // AC6 - defendant receives the settlement email
  await api.assertEmailSentByReference(claimNumber, {
    reference: 'notify-defendant-claimant-settle-the-claim-notification',
    recipientEmail: config.defendantCitizenUser.email,
    timeoutMs: 45000,
  });

  const ac4Claimant = dashboardNotifications.claimIsSettledClaimant();
  const ac4Defendant = dashboardNotifications.claimIsSettledDefendant();
  const ac5 = dashboardNotifications.ccjCancelledOnCaseSettledClaimant();

  // AC5 (new "CCJ cancelled" notification) + AC4a (settled notification) - claimant dashboard
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await verifyNotificationTitleAndContent(claimNumber, ac5.title, ac5.content, claimRef);
  await verifyNotificationTitleAndContent(claimNumber, ac4Claimant.title, ac4Claimant.content, claimRef);

  await verifyNotificationAbsent(claimNumber, ccjRequestedTitle, claimRef);

  // AC4b - settled notification on the defendant dashboard
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationTitleAndContent(claimNumber, ac4Defendant.title, ac4Defendant.content, claimRef);

  // AC1/AC2 - the requested CCJ is cancelled and the active judgment is cleared
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);
});

Scenario('Case settled during buffer - judgment cancelled and active judgment cleared (AC1, AC2) [DTSCCI-5108]', async ({api}) => {
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

  const before = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.exists(before.activeJudgment, 'activeJudgment should exist while in the buffer');

  await api.settleClaimLip(config.claimantCitizenUser);

  const after = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.notExists(after.activeJudgment, 'activeJudgment should be cleared after settlement');
  assert.notExists(after.joDJCreatedDate, 'joDJCreatedDate should be cleared after settlement');
});
