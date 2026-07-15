const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {checkToggleEnabled, updateCaseData, triggerJudgmentBufferScheduler} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent, verifyNotificationAbsent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const ccjRequestedTitle = 'The CCJ has been requested';
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

function londonBackdate(hoursAgo) {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}).formatToParts(d);
  const p = {}; parts.forEach(x => { p[x.type] = x.value; });
  const hour = p.hour === '24' ? '00' : p.hour;
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}`;
}

const runBufferSchedulerUntilIssued = async (api, attempts = 30, intervalMs = 10000) => {
  for (let i = 0; i < attempts; i++) {
    await triggerJudgmentBufferScheduler();
    const data = await api.retrieveCaseData(config.adminUser, claimRef);
    if (data.joIsLiveJudgmentExists === 'Yes') {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
};

Feature('Lip v Lip claim - Judgment Requested state - Stay lifted').tag('@ui-judgment-buffer');

Scenario('Stay lifted on a JUDGMENT_REQUESTED case returns it to Awaiting Defendant Response, with claimant + defendant emails and dashboard notifications (AC1-AC4) [DTSCCI-5109]', async ({I, api}) => {
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

  // Claimant requests a CCJ - the case enters the JUDGMENT_REQUESTED buffer
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  // Stay the case, then lift the stay
  await api.stayCase(config.ctscAdmin);

  // AC1 - lifting the stay on a JUDGMENT_REQUESTED case returns it to Awaiting Defendant Response
  await api.liftStay(config.ctscAdmin, 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT');

  // AC2 - both parties are emailed that there is an update on the claim (the stay has been lifted)
  await api.assertEmailSentByReference(claimRef, {
    reference: 'stay-lifted-claimant-notification',
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 60000,
  });
  await api.assertEmailSentByReference(claimRef, {
    reference: 'stay-lifted-defendant-notification',
    recipientEmail: config.defendantCitizenUser.email,
    timeoutMs: 60000,
  });

  const stayLifted = dashboardNotifications.stayLifted();
  const responseClaimant = dashboardNotifications.responseToClaimAfterDeadlineClaimant();
  const responseDefendant = dashboardNotifications.responseToClaimAfterDeadlineDefendant();

  // AC4 - claimant dashboard: the stay has been lifted + the claimant can now request a CCJ
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await verifyNotificationTitleAndContent(claimNumber, stayLifted.title, stayLifted.content, claimRef);
  await verifyNotificationTitleAndContent(claimNumber, responseClaimant.title, responseClaimant.content, claimRef);

  await verifyNotificationAbsent(claimNumber, ccjRequestedTitle, claimRef);

  // AC3 - defendant dashboard: the stay has been lifted + the defendant has not yet responded
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationTitleAndContent(claimNumber, stayLifted.title, stayLifted.content, claimRef, 'defendant');
  await verifyNotificationTitleAndContent(claimNumber, responseDefendant.title, responseDefendant.content, claimRef, 'defendant');
});

Scenario('After the stay is lifted the claimant can re-request a CCJ, which issues judgment notifications to both parties (AC1, AC5, AC6) [DTSCCI-5109]', async ({I, api}) => {
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

  // First CCJ request -> buffer -> stay -> lift back to Awaiting Defendant Response (AC1)
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();
  await api.stayCase(config.ctscAdmin);
  await api.liftStay(config.ctscAdmin, 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT');

  // AC1 (continued) - the claimant re-requests a CCJ once the stay is lifted
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBufferReRequest(claimRef);
  await api.waitForFinishedBusinessProcess();

  // Push the re-requested judgment past its buffer and let the scheduler issue it
  await updateCaseData(claimRef, {joDJCreatedDate: londonBackdate(144)});
  const issued = await runBufferSchedulerUntilIssued(api);
  assert.isTrue(issued, 'the judgment buffer scheduler should issue the re-requested CCJ');
  await api.waitForFinishedBusinessProcess();

  const ac5 = dashboardNotifications.defaultJudgmentGrantedClaimant();
  const ac6 = dashboardNotifications.defaultJudgmentIssuedDefendant();

  // AC5 - claimant dashboard: a judgment against the defendant has been made
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await verifyNotificationTitleAndContent(claimNumber, ac5.title, ac5.content, claimRef);

  // AC6 - defendant dashboard: a judgment has been made against you
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationTitleAndContent(claimNumber, ac6.title, ac6.content, claimRef, 'defendant');
});
