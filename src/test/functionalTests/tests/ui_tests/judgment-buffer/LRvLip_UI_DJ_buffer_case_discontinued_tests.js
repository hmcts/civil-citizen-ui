const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {dateTime} = require('../../../specClaimHelpers/api/dataHelper');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
const applicantLR = config.applicantSolicitorUser;
const defendant = config.defendantCitizenUser;
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('LR v Lip claim - Judgment Requested state - Case discontinued').tag('@ui-judgment-buffer');

Scenario('LRvLip case discontinued during buffer - CCJ cancelled, defendant discontinuance status/notification + email (AC1-AC4, AC6) [DTSCCI-5107]', async ({I, api}) => {
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

  await api.discontinueClaim(config.applicantSolicitorUser, 'ONE_V_ONE_NO_P_NEEDED');
  await api.waitForFinishedBusinessProcess();

  // AC1/AC2 - the requested CCJ is cancelled and the active judgment is cleared
  await api.assertActiveJudgmentDetailsNotPresent(claimRef);

  // AC6 - defendant receives the notice-of-discontinuance email
  await api.assertEmailSentByReference(claimNumber, {
    reference: 'defendant-claim-discontinued',
    recipientEmail: defendant.email,
    timeoutMs: 45000,
  });

  // AC3/AC4 - defendant dashboard status + notice-of-discontinuance notification
  await LoginSteps.EnterCitizenCredentials(defendant.email, defendant.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  const discontinuanceNotice = dashboardNotifications.discontinuanceNoticeDefendant();
  await verifyNotificationTitleAndContent(claimNumber, discontinuanceNotice.title, discontinuanceNotice.content, claimRef);
  // AC5 is N/A for discontinue (claimant-only notification): the defendant must NOT see a CCJ-cancelled message
  await I.dontSee('The CCJ you requested has been cancelled.');
});
