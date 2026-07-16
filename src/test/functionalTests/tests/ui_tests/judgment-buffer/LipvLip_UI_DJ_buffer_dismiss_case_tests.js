const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent, verifyNotificationAbsent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const ccjRequestedTitle = 'The CCJ has been requested';
const statusCell = (text) => `//tr[.//td[.//a[normalize-space()='${text}']]]/td[4]`;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('Lip v Lip claim - Judgment Requested state - Case dismissed').tag('@ui-judgment-buffer');

Scenario('Case dismissed during JUDGMENT_REQUESTED buffer - CCJ cancelled, AC1-AC6 (English + Welsh) [DTSCCI-5106]', async ({I, api}) => {
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

  await api.dismissCase(config.ctscAdmin, claimRef);

  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const claimantEmail = await api.assertEmailSentByReference(claimNumber, {
    reference: 'dismiss-case-claimant-notification',
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
  assert.equal(claimantEmail.templateId, 'edf3ac20-fb30-43ac-a0fd-dc72f9f37aaf');
  await api.assertEmailSentByReference(claimNumber, {
    reference: 'dismiss-case-defendant-notification',
    recipientEmail: config.defendantCitizenUser.email,
    timeoutMs: 45000,
  });

  const ac4 = dashboardNotifications.caseDismissedNotification();
  const ac4Welsh = dashboardNotifications.caseDismissedNotificationWelsh();
  const ac5 = dashboardNotifications.ccjCancelledOnCaseDismissalClaimant();
  const ac5Welsh = dashboardNotifications.ccjCancelledOnCaseDismissalClaimantWelsh();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The case has been closed.', statusCell(claimNumber));
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await verifyNotificationTitleAndContent(claimNumber, ac5.title, ac5.content, claimRef);
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);

  await verifyNotificationAbsent(claimNumber, ccjRequestedTitle, claimRef);

  await I.click('Cymraeg');
  await verifyNotificationTitleAndContent(claimNumber, ac5Welsh.title, ac5Welsh.content, claimRef);
  await verifyNotificationTitleAndContent(claimNumber, ac4Welsh.title, ac4Welsh.content, claimRef);
  await I.click('English');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The case has been closed.', statusCell(claimNumber));
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);
  await I.dontSee('The CCJ you requested has been cancelled.');
  await I.click('Cymraeg');
  await verifyNotificationTitleAndContent(claimNumber, ac4Welsh.title, ac4Welsh.content, claimRef);
});

Scenario('Case dismissed during buffer - judgment cancelled and case state moves to CASE_DISMISSED (AC1, AC2) [DTSCCI-5106]', async ({api}) => {
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

  await api.dismissCase(config.ctscAdmin, claimRef);

  const after = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.notExists(after.activeJudgment, 'activeJudgment should be cleared after dismissal');
  assert.notExists(after.joDJCreatedDate, 'joDJCreatedDate should be cleared after dismissal');
});

Scenario('Case left in buffer (not dismissed) - judgment remains in the buffer, case not dismissed (negative) [DTSCCI-5106]', async ({api}) => {
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

  const data = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.exists(data.activeJudgment, 'judgment should remain while the case is not dismissed');
  assert.equal(data.activeJudgment.state, 'PENDING_ISSUE');
});

Scenario('Case dismissed with no pending CCJ - case closed notification shown, CCJ-cancelled notification absent (negative) [DTSCCI-5106]', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, config.defendantCitizenUser.email);

  await api.dismissCase(config.ctscAdmin, claimRef);
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The case has been closed.', statusCell(claimNumber));
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  const ac4 = dashboardNotifications.caseDismissedNotification();
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);
  await I.dontSee('The case has been dismissed');
  await I.dontSee('The CCJ you requested has been cancelled.');
});

Scenario('Bilingual claimant - dismissal sends the bilingual update email (edge) [DTSCCI-5106]', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, false, 'Individual', 'BOTH', true);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await api.submitUploadTranslatedDoc('CLAIM_ISSUE');
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, config.defendantCitizenUser.email);

  await I.amOnPage('/dashboard?lang=en');
  await I.wait(2);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  await api.dismissCase(config.ctscAdmin, claimRef);
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const claimantEmail = await api.assertEmailSentByReference(claimNumber, {
    reference: 'dismiss-case-claimant-notification',
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
  assert.equal(claimantEmail.templateId, '730f4e11-3cb0-43a7-aeeb-8373a28fbc1d');
});
