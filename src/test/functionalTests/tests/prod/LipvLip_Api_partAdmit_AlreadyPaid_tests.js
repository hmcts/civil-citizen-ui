const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {
  claimIsSettledDefendant,
  claimIsSettledClaimant,
} = require('../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType;
let caseData;
let claimNumber;

Feature('Response with PartAdmit-AlreadyPaid - Small Claims & Fast Track');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant settle the claim @citizenUI @partAdmit @nightly - @api', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  console.log('isDashboardServiceEnabled..', isDashboardServiceEnabled);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaid(claimRef, claimNumber, 'disagree');
  await api.waitForFinishedBusinessProcess();

  if (isDashboardServiceEnabled) {
    const notification = claimIsSettledClaimant();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  }

  if (isDashboardServiceEnabled) {
    await I.click('Sign out');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const notification = claimIsSettledDefendant();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  }
});

Scenario('Response with PartAdmit-AlreadyPaid Fast Track and Claimant Not to settle the claim @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaidAndProceed(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).tag('@regression-cui-r2');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant decides to go for Mediation @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaidGoToMediation(claimRef, claimNumber, 'disagree');
  await api.waitForFinishedBusinessProcess();
}).tag('@regression-cui-r2');
