const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  claimIsSettledDefendant,
  claimIsSettledClaimant,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, claimType;
let caseData;
let claimNumber;

Feature('Response with PartAdmit-AlreadyPaid - Small Claims & Fast Track').tag('@nightly-prod');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant settle the claim', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await api.submitUploadTranslatedDoc('DEFENDANT_RESPONSE');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaid(claimRef, claimNumber, 'disagree');
  await api.waitForFinishedBusinessProcess();

  const claimSettledClaimantNotif = claimIsSettledClaimant();
  await verifyNotificationTitleAndContent(claimNumber, claimSettledClaimantNotif.title, claimSettledClaimantNotif.content);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimSettledDefendantNotif = claimIsSettledDefendant();
  await verifyNotificationTitleAndContent(claimNumber, claimSettledDefendantNotif.title, claimSettledDefendantNotif.content);
});

Scenario('Response with PartAdmit-AlreadyPaid Fast Track and Claimant Not to settle the claim', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await api.submitUploadTranslatedDoc('DEFENDANT_RESPONSE');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaidAndProceed(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant decides to go for Mediation', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await api.submitUploadTranslatedDoc('DEFENDANT_RESPONSE');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaidGoToMediation(claimRef, claimNumber, 'disagree');
  await api.waitForFinishedBusinessProcess();
}).tag('@api-prod');
