const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {
  defendantResponseFullAdmitPayBySetDateClaimantCoSC,
  defendantResponseConfirmYouHavePaidAJudgmentCCJDebtForDJ,
} = require('../../specClaimHelpers/dashboardNotificationConstants');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef, notification, claimNumber, caseData;

Feature('Create Lip v Lip claim -  Default Judgment @nightly');

Scenario('Create LipvLip claim and defendant not responded by deadline and Claimant raise Default Judgment', async ({api, I}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgment(claimRef);
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  notification = defendantResponseFullAdmitPayBySetDateClaimantCoSC();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await ResponseToDefenceLipVsLipSteps.ConfirmThatYouHaveBeenpPaidforCoSC(claimRef, claimNumber);
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.waitForFinishedBusinessProcess();
  notification = defendantResponseConfirmYouHavePaidAJudgmentCCJDebtForDJ();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await ResponseToDefenceLipVsLipSteps.ConfirmYouHavePaidAJudgmentCCJDebt(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).tag('@nightly');
