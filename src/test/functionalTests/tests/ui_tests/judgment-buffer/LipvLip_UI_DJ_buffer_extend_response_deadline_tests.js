const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { dateTime } = require('../../../specClaimHelpers/api/dataHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const { checkToggleEnabled } = require('../../../specClaimHelpers/api/testingSupport');
const { moreTimeRequestedClaimant, moreTimeRequestedClaimantWelsh, moreTimeRequestedDefendant, moreTimeRequestedDefendantWelsh } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { extendResponseDeadline } = require('../../../specClaimHelpers/emailNotificationConstants');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const chai = require('chai');

const { assert } = chai;
const claimType = 'SmallClaims';
const statusCell = (text) =>`//tr[.//td[.//a[normalize-space()='${text}']]]/td[4]`;
const claimant = config.claimantCitizenUser;
const defendant = config.defendantCitizenUser;
let claimRef, caseData, claimNumber, defendantName;

Feature('Lip v Lip claim - Judgment Requested state - Extend response deadline').tag('@ui-judgment-buffer');

Scenario('Create LipvLip claim, claimant raises CCJ - Judgment Buffer - Extend response deadline', async ({ I, api }) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  await createAccount(claimant.email, claimant.password);
  await createAccount(defendant.email, defendant.password);
  claimRef = await api.createLiPClaim(claimant, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  defendantName = await caseData.respondent1.partyName;
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2, dateTime(-2).slice(0, 19));
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, defendant.email);

  await LoginSteps.EnterCitizenCredentials(claimant.email, claimant.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();
  await api.extendResponseDeadline(config.ctscAdmin, claimRef, dateTime(15).split('T')[0]);
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);
  await I.click('Sign out');

  const claimantEmailNotification = await api.assertEmailSent(claimNumber, {
    recipientEmail: claimant.email,
    timeoutMs: 45000,
  });
  assert.equal(claimantEmailNotification.templateId, extendResponseDeadline.claimant.templateId);

  const defendantEmailNotification = await api.assertEmailSent(claimNumber, {
    recipientEmail: defendant.email,
    timeoutMs: 45000,
  });
  assert.equal(defendantEmailNotification.templateId, extendResponseDeadline.defendant.templateId);

  await LoginSteps.EnterCitizenCredentials(claimant.email, claimant.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard(`${defendantName} has requested more time to respond.`, statusCell(claimNumber));
  await I.click('Cymraeg');
  await CitizenDashboardSteps.VerifyStatusOnDashboardWelsh(`Mae ${defendantName} wedi gofyn am fwy o amser i ymateb.`, statusCell(claimNumber));
  await I.click('English');
  await I.click(claimNumber);
  await I.see('View the claim');
  const moreTimeRequestedClaimantNotif = moreTimeRequestedClaimant();
  const moreTimeRequestedClaimantNotifWelsh = moreTimeRequestedClaimantWelsh();
  await verifyNotificationTitleAndContent(claimNumber, moreTimeRequestedClaimantNotif.title, moreTimeRequestedClaimantNotif.content, claimRef);
  await I.click('Cymraeg');
  await verifyNotificationTitleAndContent(claimNumber, moreTimeRequestedClaimantNotifWelsh.title, moreTimeRequestedClaimantNotifWelsh.content, claimRef);
  await I.click('English');

  await I.click('Sign out');
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