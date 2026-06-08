const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { dateTime } = require('../../../specClaimHelpers/api/dataHelper');
const { checkToggleEnabled } = require('../../../specClaimHelpers/api/testingSupport');
const { moreTimeRequestedDefendant, moreTimeRequestedDefendantWelsh } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { extendResponseDeadline } = require('../../../specClaimHelpers/emailNotificationConstants');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const chai = require('chai');

const { assert } = chai;
const claimType = 'SmallClaims';
const statusCell = (text) =>`//tr[.//td[.//a[normalize-space()='${text}']]]/td[4]`;
const applicantLR = config.applicantSolicitorUser;
const defendant = config.defendantCitizenUser;
let claimRef, caseData, claimNumber;

Feature('LR v Lip claim - Judgment Requested state - Extend response deadline').tag('@ui-judgment-buffer');

Scenario('Create LRvLip claim, claimant solictor raises CCJ - Judgment Buffer - Extend response deadline', async ({ I, api }) => {
  const judgmentBufferEnabled = await checkToggleEnabled('judgment-buffer'); 
  if (!judgmentBufferEnabled) return;
  await createAccount(defendant.email, defendant.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, false, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2, dateTime(-2).slice(0, 19));
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, defendant.email);
  await api.amendApplicantSolicitor1Email(claimRef, config.systemUpdate2, applicantLR.email);

  await api.defaultJudgmentSpec(config.applicantSolicitorUser, judgmentBufferEnabled);
  await api.waitForFinishedBusinessProcess();

  await api.extendResponseDeadline(config.ctscAdmin, claimRef, dateTime(15).split('T')[0]);
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const applicantLREmailNotification = await api.assertEmailSent(claimNumber, {
    recipientEmail: applicantLR.email,
    timeoutMs: 45000,
  });
  assert.equal(applicantLREmailNotification.templateId, extendResponseDeadline.applicantLR.templateId);

  const defendantEmailNotification = await api.assertEmailSent(claimNumber, {
    recipientEmail: defendant.email,
    timeoutMs: 45000,
  });
  assert.equal(defendantEmailNotification.templateId, extendResponseDeadline.defendant.templateId);

  await LoginSteps.EnterCitizenCredentials(defendant.email, defendant.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('Respond to claim:', statusCell(claimNumber));
  await I.click('Cymraeg');
  await CitizenDashboardSteps.VerifyStatusOnDashboardWelsh('Ymateb i hawliad:', statusCell(claimNumber));
  await I.click('English');
  await I.click(claimNumber);
  await I.see('Respond to the claim');
  await I.see('View the claim');
  const moreTimeRequestedDefendantNotif = moreTimeRequestedDefendant();
  const moreTimeRequestedDefendantNotifWelsh = moreTimeRequestedDefendantWelsh();
  await verifyNotificationTitleAndContent(claimNumber, moreTimeRequestedDefendantNotif.title, moreTimeRequestedDefendantNotif.content, claimRef);
  await I.click('Cymraeg');
  await verifyNotificationTitleAndContent(claimNumber, moreTimeRequestedDefendantNotifWelsh.title, moreTimeRequestedDefendantNotifWelsh.content, claimRef);
});