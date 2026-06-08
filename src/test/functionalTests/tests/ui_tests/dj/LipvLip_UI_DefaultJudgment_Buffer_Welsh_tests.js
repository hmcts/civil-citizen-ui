const config = require('../../../../config');

const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
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

Feature('Create Lip v Lip claim -  Default Judgment buffer notifications (Welsh)').tag('@ui-dj');

// DTSCCI-5096 - Welsh (Cymraeg) coverage of the Judgment Buffer notifications shown after a CCJ is requested.
// The CCJ request itself is performed in English; the dashboard is then switched to Welsh (?lang=cy, which is
// cached to the `lang` cookie for the rest of the session) and the translated status messages + notification
// cards are asserted. Welsh fragments are apostrophe-free so the assertion is robust to apostrophe encoding.
Scenario('Claimant and defendant see the Welsh judgment-requested notifications after a CCJ is requested', async ({I, api}) => {
  const judgmentBufferEnabled = await checkToggleEnabled('judgment-buffer');
  if (!judgmentBufferEnabled) {
    // Buffer notifications only exist when the judgment-buffer flag is on.
    return;
  }

  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  // 'BOTH' sets claimantBilingualLanguagePreference so the judgment-requested email is bilingual/Welsh
  // (mainClaimWelshEnabled stays false, so this does NOT trigger the document-translation flow).
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, false, 'Individual', 'BOTH');
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
  // Let the amended (past) response deadline index in ES, then run the defendant response-deadline
  // scheduler so the defendant gets the "response time elapsed" notification that AC5 reuses.
  await I.wait(20);
  await runScheduler('DefendantResponseDeadline');
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  // Claimant requests the CCJ (English journey) - in buffer mode it is not granted straight away.
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  // The status cell (4th column) of the dashboard row for this claim
  const statusCell = 'xpath=//table[contains(@class,"govuk-table")]'
    + `//tr[.//td[.//a[normalize-space()='${claimNumber}']]]/td[4]`;

  // ---- Claimant dashboard in Welsh ----
  await I.amOnPage('/dashboard?lang=cy');
  await I.waitForElement(statusCell, 60);

  // AC1 (Welsh) - "Bu ichi ofyn am Ddyfarniad Llys Sirol yn erbyn <defendant>"
  await I.waitForText(`Bu ichi ofyn am Ddyfarniad Llys Sirol yn erbyn ${defendantName}`, 60, statusCell);

  // AC2 (Welsh) - claimant case notification
  const claimantNotification = claimantNotificationJudgmentRequestedBuffer();
  await verifyNotificationTitleAndContent(claimNumber, claimantNotification.titleCy, claimantNotification.contentCy);

  // AC3 (Welsh) - bilingual claimant receives the judgment-requested email; no such email to the defendant.
  const claimantEmail = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });
  console.log('AC3 (cy) claimant judgment-requested email templateId:', claimantEmail && claimantEmail.templateId);
  await api.assertNoEmailSent(claimNumber, {
    templateId: claimantEmail.templateId,
    recipientEmail: config.defendantCitizenUser.email,
    withinMs: 5000,
  });

  // Switch back to English to use the (English) "Sign out" link, then log in as the defendant.
  await I.amOnPage('/dashboard?lang=en');
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  // ---- Defendant dashboard in Welsh ----
  await I.amOnPage('/dashboard?lang=cy');
  await I.waitForElement(statusCell, 60);

  // AC4 (Welsh) - "...Gall <claimant> nawr ofyn am Ddyfarniad Llys Sirol yn eich erbyn..."
  await I.waitForText(`Gall ${claimantName} nawr ofyn am Ddyfarniad Llys Sirol yn eich erbyn`, 60, statusCell);

  // AC5 (Welsh) - defendant case notification (reused "you have not responded" message)
  const defendantNotification = defendantNotificationJudgmentRequestedBuffer(claimantName);
  await verifyNotificationTitleAndContent(claimNumber, defendantNotification.titleCy, defendantNotification.contentCy);
});
