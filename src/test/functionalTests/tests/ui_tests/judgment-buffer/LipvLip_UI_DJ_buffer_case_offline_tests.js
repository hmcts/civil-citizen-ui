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

Feature('Lip v Lip claim - Judgment Requested state - Case taken offline').tag('@ui-judgment-buffer');

Scenario('Case taken offline during JUDGMENT_REQUESTED buffer - CCJ cancelled, AC1-AC5 (English + Welsh) [DTSCCI-5102]', async ({I, api}) => {
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

  await api.caseProceedsInCaseman(config.ctscAdmin);

  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const ac4 = dashboardNotifications.caseOffline();
  const ac4Welsh = dashboardNotifications.caseOfflineWelsh();
  const ac5 = dashboardNotifications.ccjCancelledOnCaseOfflineClaimant();
  const ac5Welsh = dashboardNotifications.ccjCancelledOnCaseOfflineClaimantWelsh();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.wait(3);
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
  await I.amOnPage('/dashboard');
  await I.wait(3);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);
  await I.dontSee('The CCJ you requested has been cancelled.');
});

Scenario('Case taken offline during buffer - judgment cancelled and case moves to proceeds-offline state (AC1, AC2) [DTSCCI-5102]', async ({api}) => {
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

  // caseProceedsInCaseman asserts the case moves to PROCEEDS_IN_HERITAGE_SYSTEM (AC2)
  await api.caseProceedsInCaseman(config.ctscAdmin);

  const after = await api.retrieveCaseData(config.adminUser, claimRef);
  assert.notExists(after.activeJudgment, 'activeJudgment should be cleared after the case goes offline');
});

Scenario('Case left in buffer (not taken offline) - judgment remains in the buffer (negative) [DTSCCI-5102]', async ({api}) => {
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
  assert.exists(data.activeJudgment, 'judgment should remain while the case is not taken offline');
  assert.equal(data.activeJudgment.state, 'PENDING_ISSUE');
});

Scenario('Case taken offline with no pending CCJ - offline notification shown, CCJ-cancelled notification absent (negative) [DTSCCI-5102]', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, config.defendantCitizenUser.email);

  await api.caseProceedsInCaseman(config.ctscAdmin);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.wait(3);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  const ac4 = dashboardNotifications.caseOffline();
  await verifyNotificationTitleAndContent(claimNumber, ac4.title, ac4.content, claimRef);
  await I.dontSee('The CCJ you requested has been cancelled.');
});

Scenario('Bilingual claimant - taken offline shows the bilingual CCJ-cancelled notification (edge) [DTSCCI-5102]', async ({I, api}) => {
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

  await api.caseProceedsInCaseman(config.ctscAdmin);
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  const ac5Welsh = dashboardNotifications.ccjCancelledOnCaseOfflineClaimantWelsh();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.wait(3);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await I.click('Cymraeg');
  await verifyNotificationTitleAndContent(claimNumber, ac5Welsh.title, ac5Welsh.content, claimRef);
});
