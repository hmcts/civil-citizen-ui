const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {dateTime} = require('../../../specClaimHelpers/api/dataHelper');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const applicantLR = config.applicantSolicitorUser;
const defendant = config.defendantCitizenUser;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('LR v Lip claim - Judgment Requested state - Case taken offline').tag('@ui-judgment-buffer');

Scenario('LRvLip case taken offline during buffer - CCJ cancelled, defendant offline status/notification + claimant-solicitor email (AC1-AC4, AC6) [DTSCCI-5102]', async ({I, api}) => {
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

  await api.caseProceedsInCaseman(config.ctscAdmin);

  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  // AC6 - email to the claimant solicitor only (LR v LiP)
  const offlineEmail = await api.assertEmailSentByReference(claimNumber, {
    reference: 'case-proceeds-in-caseman-applicant-notification',
    recipientEmail: applicantLR.email,
    timeoutMs: 45000,
  });
  assert.equal(offlineEmail.templateId, '0928c6fa-f9b1-45f9-9fd2-57b0bed7d79b');

  await LoginSteps.EnterCitizenCredentials(defendant.email, defendant.password);
  await I.amOnPage('/dashboard');
  await I.wait(3);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  const ac4 = dashboardNotifications.caseOffline();
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);
  await I.dontSee('The CCJ you requested has been cancelled.');
  await I.click('Cymraeg');
  const ac4Welsh = dashboardNotifications.caseOfflineWelsh();
  await verifyNotificationTitleAndContent(claimNumber, ac4Welsh.title, ac4Welsh.content, claimRef);
});
