// TODO undo this once the stop from choosing settlement agreement is removed
// const config = require('../../../config');
// const LoginSteps = require('../../commonFeatures/home/steps/login');
// const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
// const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
// const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
// const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
// const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
// const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
// const {
//   defendantRejectsSettlementDefendant,
//   defendantRejectsSettlementClaimant,
//   claimantAskDefendantToSignSettlementClaimant,
//   claimantAskDefendantToSignSettlementDefendant,
//   defendantAcceptsSettlementClaimant,
//   defendantAcceptsSettlementDefendant,
// } = require('../../specClaimHelpers/dashboardNotificationConstants');
//
// const claimType = 'SmallClaims';
// // eslint-disable-next-line no-unused-vars
// let claimRef;
// let caseData;
// let claimNumber;
//
// Feature('Create Lip v Lip claim -  Full Admit Pay by Set Date By Defendant and Accepted and raise SSA By Claimant ');
//
// Scenario('Create LipvLip claim and defendant response as FullAdmit pay by set date and SSA by Claimant and Defendant - @api', async ({
//   I,
//   api,
// }) => {
//   await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
//   caseData = await api.retrieveCaseData(config.adminUser, claimRef);
//   claimNumber = await caseData.legacyCaseReference;
//   const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
//   console.log('isDashboardServiceEnabled..', isDashboardServiceEnabled);
//   await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
//   await api.waitForFinishedBusinessProcess();
//   await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateSSA(claimRef, claimNumber);
//   await api.waitForFinishedBusinessProcess();
//   await I.click('Sign out');
//   await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
//   await ResponseSteps.DefendantAdmissionSSA(claimRef, 'yes');
//   await api.waitForFinishedBusinessProcess();
//
//   if (isDashboardServiceEnabled) {
//     const notification = defendantAcceptsSettlementDefendant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
//
//   await I.click('Sign out');
//   await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   if (isDashboardServiceEnabled) {
//     const notification = defendantAcceptsSettlementClaimant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
// }).tag('@nightly');
//
// Scenario('Create LipvLip claim and defendant response as FullAdmit pay by set date and SSA by Claimant and reject by Defendant - @api', async ({
//   I,
//   api,
// }) => {
//   await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
//   caseData = await api.retrieveCaseData(config.adminUser, claimRef);
//   claimNumber = await caseData.legacyCaseReference;
//   const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
//   console.log('isDashboardServiceEnabled..', isDashboardServiceEnabled);
//   await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
//   await api.waitForFinishedBusinessProcess();
//   await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateSSA(claimRef, claimNumber);
//   await api.waitForFinishedBusinessProcess();
//
//   if (isDashboardServiceEnabled) {
//     const notification = claimantAskDefendantToSignSettlementClaimant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
//
//   await I.click('Sign out');
//   await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
//
//   if (isDashboardServiceEnabled) {
//     const notification = claimantAskDefendantToSignSettlementDefendant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
//
//   await ResponseSteps.DefendantAdmissionSSA(claimRef, 'no');
//   await api.waitForFinishedBusinessProcess();
//
//   if (isDashboardServiceEnabled) {
//     const notification = defendantRejectsSettlementDefendant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
//
//   if (isDashboardServiceEnabled) {
//     await I.click('Sign out');
//     await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//     const notification = defendantRejectsSettlementClaimant();
//     await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
//   }
// }).tag('@regression-cui-r2');
