const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  defendantResponseFullAdmitPayBySetDateDefendant,
  defendantResponseFullAdmitPayBySetDateClaimant,
  claimantNotificationCCJRequested,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseData, claimNumber, claimRef, claimAmountAndFee = 1580, date = '1 October 2025';

Feature('Create Lip v Lip claim -  Full Admit Pay by Set Date By Defendant and Accepted and raise CCJ By Claimant').tag('@e2e-full-admit @e2e-nightly-prod');

// TODO undo when part payment journey is restored
Scenario.skip('Create LipvLip claim and defendant response as FullAdmit pay by set date', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  const defendantResponseFullAdmitPayBySetDateDefendantNotif = defendantResponseFullAdmitPayBySetDateDefendant(claimAmountAndFee, date);
  await verifyNotificationTitleAndContent(claimNumber, defendantResponseFullAdmitPayBySetDateDefendantNotif.title, defendantResponseFullAdmitPayBySetDateDefendantNotif.content);
  await I.click(defendantResponseFullAdmitPayBySetDateDefendantNotif.nextSteps);
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const defendantResponseFullAdmitPayBySetDateClaimantNotif = defendantResponseFullAdmitPayBySetDateClaimant(claimAmountAndFee);
  await verifyNotificationTitleAndContent(claimNumber, defendantResponseFullAdmitPayBySetDateClaimantNotif.title, defendantResponseFullAdmitPayBySetDateClaimantNotif.content);
  await I.click(defendantResponseFullAdmitPayBySetDateClaimantNotif.nextSteps);

  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateCCJ(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();

  if ('aat'.includes(config.runningEnv)){
    const claimantNotificationCCJRequestedNotif = claimantNotificationCCJRequested();
    await verifyNotificationTitleAndContent(claimNumber, claimantNotificationCCJRequestedNotif.title, claimantNotificationCCJRequestedNotif.content);
  }
}).tag('@e2e-prod');
