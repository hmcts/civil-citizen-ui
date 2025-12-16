const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  defendantRejectsSettlementDefendant,
  defendantRejectsSettlementClaimant,
  claimantAskDefendantToSignSettlementClaimant,
  claimantAskDefendantToSignSettlementDefendant,
  defendantAcceptsSettlementClaimant,
  defendantAcceptsSettlementDefendant,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;
let caseData;
let claimNumber;

Feature('Create Lip v Lip claim -  Full Admit Pay by Set Date By Defendant and Accepted and raise SSA By Claimant').tag('@ui-nightly-prod');

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('Create LipvLip claim and defendant response as FullAdmit pay by set date and SSA by Claimant and Defendant', async ({
  I,
  api,
}) => {
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
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.DefendantAdmissionSSA(claimRef, 'yes');
  await api.waitForFinishedBusinessProcess();

  const defendantAcceptsSettlementDefendantNotif = defendantAcceptsSettlementDefendant();
  await verifyNotificationTitleAndContent(claimNumber, defendantAcceptsSettlementDefendantNotif.title, defendantAcceptsSettlementDefendantNotif.content);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const defendantAcceptsSettlementClaimantNotif = defendantAcceptsSettlementClaimant();
  await verifyNotificationTitleAndContent(claimNumber, defendantAcceptsSettlementClaimantNotif.title, defendantAcceptsSettlementClaimantNotif.content);
});

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('Create LipvLip claim and defendant response as FullAdmit pay by set date and SSA by Claimant and reject by Defendant', async ({
  I,
  api,
}) => {
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

  const claimantAskDefendantToSignSettlementClaimantNotif = claimantAskDefendantToSignSettlementClaimant();
  await verifyNotificationTitleAndContent(claimNumber, claimantAskDefendantToSignSettlementClaimantNotif.title, claimantAskDefendantToSignSettlementClaimantNotif.content);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);

  const claimantAskDefendantToSignSettlementDefendantNotif = claimantAskDefendantToSignSettlementDefendant();
  await verifyNotificationTitleAndContent(claimNumber, claimantAskDefendantToSignSettlementDefendantNotif.title, claimantAskDefendantToSignSettlementDefendantNotif.content);

  await ResponseSteps.DefendantAdmissionSSA(claimRef, 'no');
  await api.waitForFinishedBusinessProcess();

  const defendantRejectsSettlementDefendantNotif = defendantRejectsSettlementDefendant();
  await verifyNotificationTitleAndContent(claimNumber, defendantRejectsSettlementDefendantNotif.title, defendantRejectsSettlementDefendantNotif.content);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const defendantRejectsSettlementClaimantNotif = defendantRejectsSettlementClaimant();
  await verifyNotificationTitleAndContent(claimNumber, defendantRejectsSettlementClaimantNotif.title, defendantRejectsSettlementClaimantNotif.content);
}).tag('@ui-prod');
