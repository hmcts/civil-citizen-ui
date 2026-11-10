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
const ccjRequestedContent = ['A judgment against the defendant has been requested.', 'You will be notified when this judgment is granted.'];
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

Feature('Lip v Lip claim - Judgment Requested state - Grant notification cleanup').tag('@ui-judgment-buffer');

Scenario('The requested-CCJ notification is removed from the claimant dashboard once the buffer scheduler grants judgment [DTSCCI-JB-REGRESSION]', async ({I, api}) => {
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

  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await verifyNotificationTitleAndContent(claimNumber, ccjRequestedTitle, ccjRequestedContent, claimRef);

  // Push the judgment past its buffer and let the scheduler grant it
  await updateCaseData(claimRef, {joDJCreatedDate: londonBackdate(144)});
  const issued = await runBufferSchedulerUntilIssued(api);
  assert.isTrue(issued, 'the judgment buffer scheduler should issue the CCJ');
  await api.waitForFinishedBusinessProcess();

  const granted = dashboardNotifications.defaultJudgmentGrantedClaimant();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await verifyNotificationTitleAndContent(claimNumber, granted.title, granted.content, claimRef);

  await verifyNotificationAbsent(claimNumber, ccjRequestedTitle, claimRef);
});
