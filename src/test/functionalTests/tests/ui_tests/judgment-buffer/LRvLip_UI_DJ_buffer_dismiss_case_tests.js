const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {dateTime} = require('../../../specClaimHelpers/api/dataHelper');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const statusCell = (text) => `//tr[.//td[.//a[normalize-space()='${text}']]]/td[4]`;
const applicantLR = config.applicantSolicitorUser;
const defendant = config.defendantCitizenUser;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('LR v Lip claim - Judgment Requested state - Case dismissed').tag('@ui-judgment-buffer');

Scenario('LRvLip case dismissed during buffer - CCJ cancelled, defendant dismissed status/notification + emails (AC1-AC4, AC6) [DTSCCI-5106]', async ({I, api}) => {
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

  await api.dismissCase(config.ctscAdmin, claimRef);

  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  await api.assertEmailSentByReference(claimNumber, {
    reference: 'dismiss-case-defendant-notification',
    recipientEmail: defendant.email,
    timeoutMs: 45000,
  });
  const applicantEmail = await api.assertEmailSentByReference(claimNumber, {
    reference: 'dismiss-case-claimant-notification',
    recipientEmail: applicantLR.email,
    timeoutMs: 45000,
  });
  assert.equal(applicantEmail.templateId, '0921a609-7024-4c15-ae59-66fae8a79b8c');

  await LoginSteps.EnterCitizenCredentials(defendant.email, defendant.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The case has been closed.', statusCell(claimNumber));
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  const ac4 = dashboardNotifications.caseDismissedNotification();
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);
  await I.dontSee('The CCJ you requested has been cancelled.');
  await I.click('Cymraeg');
  const ac4Welsh = dashboardNotifications.caseDismissedNotificationWelsh();
  await verifyNotificationTitleAndContent(claimNumber, ac4Welsh.title, ac4Welsh.content, claimRef);
});
