const config = require('../../../../config');

const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const { checkToggleEnabled } = require('../../../specClaimHelpers/api/testingSupport');
const { claimantNotificationDJRequested, defendantNotificationDJRequested } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');

const claimType = 'SmallClaims';
let claimRef, caseData, claimNumber;

Feature('Create Lip v Lip claim -  Default Judgment').tag('@ui-dj');

Scenario('Create LipvLip claim and defendant not responded by deadline and Claimant raise Default Judgment', async ({api, I}) => {
  const judgmentBufferEnabled = await checkToggleEnabled('judgment-buffer');
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  if (judgmentBufferEnabled) {
    await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
    await api.waitForFinishedBusinessProcess();
    return;
  }

  await ClaimantResponseSteps.verifyDefaultJudgment(claimRef);
  await api.waitForFinishedBusinessProcess();

  await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    timeoutMs: 45000,
  });

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await api.waitForFinishedBusinessProcess();
  notification = claimantNotificationDJRequested();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await I.see('Confirm that you\'ve been paid', 'h1');
  await I.click('Sign out');

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.waitForFinishedBusinessProcess();
  notification = defendantNotificationDJRequested();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await I.see('Select application', 'h1');
});
