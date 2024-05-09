const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {defendantRejectsSettlement} = require('../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;
let caseData;
let claimNumber;

Feature('Create Lip v Lip claim -  Full Admit Pay by Set Date By Defendant and Accepted and raise SSA By Claimant');

Scenario('Create LipvLip claim and defendant response as FullAdmit pay by set date and SSA by Claimant and Defendant - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateSSA(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
    await ResponseSteps.SignOut();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
    await ResponseSteps.DefendantAdmissionSSA(claimRef, 'yes');
  }
}).tag('@regression-r2');

Scenario('Create LipvLip claim and defendant response as FullAdmit pay by set date and SSA by Claimant and reject by Defendant - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateSSA(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
    await ResponseSteps.SignOut();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
    await ResponseSteps.DefendantAdmissionSSA(claimRef, 'no');

    if (isDashboardServiceEnabled) {
      const notification = defendantRejectsSettlement();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    }
  }
}).tag('@regression-r2');
