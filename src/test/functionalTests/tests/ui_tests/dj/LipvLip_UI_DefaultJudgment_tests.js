const config = require('../../../../config');

const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {checkToggleEnabled, runScheduler} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  claimantNotificationJudgmentRequestedBuffer,
  defendantNotificationJudgmentRequestedBuffer,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
const defendantName = 'Sir John Doe';
const claimantName = 'Miss Jane Doe';
let claimRef, caseData, claimNumber;

Feature('Create Lip v Lip claim -  Default Judgment').tag('@ui-dj');

Scenario('Create LipvLip claim and defendant not responded by deadline and Claimant raise Default Judgment', async ({I, api}) => {
  const judgmentBufferEnabled = await checkToggleEnabled('judgment-buffer');
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
  if (judgmentBufferEnabled) {
    // Let the amended (past) response deadline index in ES, then run the defendant response-deadline
    // scheduler so the defendant gets the "response time elapsed" notification that AC5 reuses.
    await I.wait(20);
    await runScheduler('DefendantResponseDeadline');
    await api.waitForFinishedBusinessProcess();
  }
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  if (judgmentBufferEnabled) {
    // DTSCCI-5096 - Judgment Buffer Notifications after a CCJ has been requested.
    // With the buffer enabled the CCJ is no longer granted straight away, so the
    // claimant and defendant get notifications/status messages making this clear.
    await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
    await api.waitForFinishedBusinessProcess();

    // The status cell (4th column) of the dashboard row for this claim
    const statusCell = 'xpath=//table[contains(@class,"govuk-table")]'
      + `//tr[.//td[.//a[normalize-space()='${claimNumber}']]]/td[4]`;

    // AC1 - Claimant dashboard status message
    await I.amOnPage('/dashboard');
    await CitizenDashboardSteps.VerifyStatusOnDashboard(
      `You requested a County Court Judgment against ${defendantName}`, statusCell);

    // AC2 - Claimant case notification (judgment requested)
    const claimantNotification = claimantNotificationJudgmentRequestedBuffer();
    await verifyNotificationTitleAndContent(claimNumber, claimantNotification.title, claimantNotification.content);

    // AC3 - Claimant receives the judgment-requested email; no such email is sent to the defendant at this stage
    const claimantEmail = await api.assertEmailSent(claimNumber, {
      recipientEmail: config.claimantCitizenUser.email,
      timeoutMs: 45000,
    });
    console.log('AC3 claimant judgment-requested email templateId:', claimantEmail && claimantEmail.templateId);
    await api.assertNoEmailSent(claimNumber, {
      templateId: claimantEmail.templateId,
      recipientEmail: config.defendantCitizenUser.email,
      withinMs: 5000,
    });

    await I.click('Sign out');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

    // AC4 - Defendant dashboard status message
    await I.amOnPage('/dashboard');
    await CitizenDashboardSteps.VerifyStatusOnDashboard(
      `You haven't responded to the claim. ${claimantName} can now ask for a County Court Judgment (CCJ) against you. `
      + 'You can still respond to this claim before a CCJ is entered.', statusCell);

    // AC5 - Defendant case notification (reused "you have not responded" message)
    const defendantNotification = defendantNotificationJudgmentRequestedBuffer(claimantName);
    await verifyNotificationTitleAndContent(claimNumber, defendantNotification.title, defendantNotification.content);
    return;
  }

  await ClaimantResponseSteps.verifyDefaultJudgment(claimRef);
  await api.waitForFinishedBusinessProcess();

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
});
