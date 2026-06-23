const config = require('../../../../config');

const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const { waitForFinishedBusinessProcess } = require('../../../specClaimHelpers/api/testingSupport');
const { judgmentOnlineCcjIssuedClaimant, judgmentOnlineCcjIssuedDefendant } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;

Feature('Create Lip v Lip claim -  Judgment by Admissions').tag('@civil-citizen-nightly @ui-jba');

// TODO undo when part payment journey is restored
Scenario.skip('Create LipvLip claim and defendant responded FullAdmit and PayImmediately and Claimant raise Judgment by Admissions', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  // During Defendant response itself, update the payment deadline to past date
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayImmediateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyJudgmentByAdmission(claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('LipvLip - PartAdmit-PayBySetDate - Claimant accepts - suggests repayment plan and requests CCJ', async ({ api, I }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.waitForFinishedBusinessProcess();
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDateRejectRepaymentPlanCCJ(claimRef, '456', claimNumber);
  await api.waitForFinishedBusinessProcess();
  await I.click('Money Claims');
  let notification = judgmentOnlineCcjIssuedClaimant();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await I.see('Confirm that you\'ve been paid', 'h1');
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  notification = judgmentOnlineCcjIssuedDefendant();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
});
