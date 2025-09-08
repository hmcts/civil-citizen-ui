const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {
  defendantResponseFullAdmitPayBySetDateDefendant,
  defendantResponseFullAdmitPayBySetDateClaimant, defendantResponseFullAdmitPayBySetDateClaimantCoSC, defendantResponseConfirmYouHavePaidAJudgmentCCJDebt,
  claimantNotificationCCJRequested,
} = require('../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseData, claimNumber, claimRef, claimAmountAndFee = 1580, date = '1 October 2025';

Feature('Create Lip v Lip claim -  Full Admit Pay by Set Date By Defendant and Accepted and raise CCJ By Claimant').tag('@full-admit @nightly');

// TODO undo when part payment journey is restored
Scenario('Create LipvLip claim and defendant response as FullAdmit pay by set date', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  console.log('isDashboardServiceEnabled..', isDashboardServiceEnabled);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = defendantResponseFullAdmitPayBySetDateDefendant(claimAmountAndFee, date);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    await I.click(notification.nextSteps);
  }
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  if (isDashboardServiceEnabled) {
    const notification = defendantResponseFullAdmitPayBySetDateClaimant(claimAmountAndFee, date);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    await I.click(notification.nextSteps);
  }
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateCCJ(claimRef, claimNumber);
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  if (isDashboardServiceEnabled) {
    const notification = defendantResponseFullAdmitPayBySetDateClaimantCoSC();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    await I.click(notification.nextSteps);
  }
  await ResponseToDefenceLipVsLipSteps.ConfirmThatYouHaveBeenpPaidforCoSC(claimRef, claimNumber);
  await I.click('Sign out');

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = defendantResponseConfirmYouHavePaidAJudgmentCCJDebt();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  }
  await ResponseToDefenceLipVsLipSteps.ConfirmYouHavePaidAJudgmentCCJDebt(claimRef, claimNumber);

  await api.waitForFinishedBusinessProcess();

  if ('aat'.includes(config.runningEnv)){
    if (isDashboardServiceEnabled) {
      const notification = claimantNotificationCCJRequested();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    }
  }
}).tag('@regression');
