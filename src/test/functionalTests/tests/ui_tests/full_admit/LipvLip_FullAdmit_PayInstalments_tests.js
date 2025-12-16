const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  respondToClaim,
  defendantResponseFullAdmitPayInstalments,
  defendantResponseFullAdmitPayInstalmentsClaimant,
  claimantAskDefendantToSignSettlementCourtPlanDefendant,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseData, claimNumber, claimRef, claimAmountAndFee = 1580, instalmentAmount = 100, date = '1 October 2025';

Feature('Create Lip v Lip claim -  Full Admit Pay by Instalments By Defendant').tag('@e2e-nightly-prod');

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('Create LipvLip claim and defendant response as FullAdmit pay by instalments', async ({I, api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);

  const respondToClaimNotif = respondToClaim();
  await verifyNotificationTitleAndContent(claimNumber, respondToClaimNotif.title, respondToClaimNotif.content);
  await I.click(respondToClaimNotif.nextSteps);

  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayByInstallmentWithIndividual);
  await api.waitForFinishedBusinessProcess();

  const defendantResponseFullAdmitPayInstalmentsNotif = defendantResponseFullAdmitPayInstalments(claimAmountAndFee, instalmentAmount, date);
  await verifyNotificationTitleAndContent(claimNumber, defendantResponseFullAdmitPayInstalmentsNotif.title, defendantResponseFullAdmitPayInstalmentsNotif.content);
  await I.click(defendantResponseFullAdmitPayInstalmentsNotif.nextSteps);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  const defendantResponseFullAdmitPayInstalmentsClaimantNotif = defendantResponseFullAdmitPayInstalmentsClaimant(claimAmountAndFee, instalmentAmount, date);
  await verifyNotificationTitleAndContent(claimNumber, defendantResponseFullAdmitPayInstalmentsClaimantNotif.title, defendantResponseFullAdmitPayInstalmentsClaimantNotif.content);

  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsRejectionOfFullAdmitPayByInstalmentsSSA(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimantAskDefendantToSignSettlementCourtPlanDefendantNotif = claimantAskDefendantToSignSettlementCourtPlanDefendant();
  await verifyNotificationTitleAndContent(claimNumber, claimantAskDefendantToSignSettlementCourtPlanDefendantNotif.title, claimantAskDefendantToSignSettlementCourtPlanDefendantNotif.content);
});
