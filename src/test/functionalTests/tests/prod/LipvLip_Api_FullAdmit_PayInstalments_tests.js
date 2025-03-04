// TODO undo this once the stop from choosing settlement agreement is removed
// const config = require('../../../config');
// const LoginSteps = require('../../commonFeatures/home/steps/login');
// const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
// const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
// const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
// const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
// const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
// const {
//   respondToClaim,
//   defendantResponseFullAdmitPayInstalments,
//   defendantResponseFullAdmitPayInstalmentsClaimant,
//   claimantAskDefendantToSignSettlementCourtPlanDefendant,
// } = require('../../specClaimHelpers/dashboardNotificationConstants');
//
// const claimType = 'SmallClaims';
// // eslint-disable-next-line no-unused-vars
// let caseData, claimNumber, claimRef, claimAmountAndFee = 1580, instalmentAmount = 100, date = '1 October 2025';
//
// Feature('Create Lip v Lip claim -  Full Admit Pay by Instalments By Defendant');
//
// Scenario('Create LipvLip claim and defendant response as FullAdmit pay by instalments - @api', async ({I, api}) => {
//   await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
//   caseData = await api.retrieveCaseData(config.adminUser, claimRef);
//   claimNumber = await caseData.legacyCaseReference;
//   const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
//   console.log('isDashboardServiceEnabled..', isDashboardServiceEnabled);
//   await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
//
//   if (isDashboardServiceEnabled) {
//     const notification = respondToClaim();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//     await I.click(notification.nextSteps);
//   }
//
//   await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayByInstallmentWithIndividual);
//   await api.waitForFinishedBusinessProcess();
//
//   if (isDashboardServiceEnabled) {
//     const notification = defendantResponseFullAdmitPayInstalments(claimAmountAndFee, instalmentAmount, date);
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//     await I.click(notification.nextSteps);
//   }
//
//   await I.click('Sign out');
//   await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//
//   if (isDashboardServiceEnabled) {
//     const notification = defendantResponseFullAdmitPayInstalmentsClaimant(claimAmountAndFee, instalmentAmount, date);
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
//
//   await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsRejectionOfFullAdmitPayByInstalmentsSSA(claimRef, claimNumber);
//   await api.waitForFinishedBusinessProcess();
//
//   if (isDashboardServiceEnabled) {
//     await I.click('Sign out');
//     await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//     const notification = claimantAskDefendantToSignSettlementCourtPlanDefendant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
// }).tag('@nightly');
