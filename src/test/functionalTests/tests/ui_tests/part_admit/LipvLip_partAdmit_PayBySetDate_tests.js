const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
//const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
//const {judgmentRequestedCourtAgrees} = require('../../../specClaimHelpers/dashboardNotificationConstants');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType, claimNumber;

Feature('Response with PartAdmit-PayBySetDate - Small Claims & Fast Track').tag('@e2e-nightly-prod');

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('Response with PartAdmit-PayBySetDate Small claims', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
  await api.waitForFinishedBusinessProcess();

  //Claimant response below here
  let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDate(claimRef, '456', claimNumber);
  await api.waitForFinishedBusinessProcess();
});

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('Response with PartAdmit-PayBySetDate Fast Track', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
  await api.waitForFinishedBusinessProcess();

  //Claimant response below here
  let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDate(claimRef, '3456', claimNumber);
  await api.waitForFinishedBusinessProcess();
});

// TODO undo when part payment journey is restored
Scenario.skip('Response with PartAdmit-PayBySetDate Small claims Reject repayment plan Request CCJ', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
  await api.waitForFinishedBusinessProcess();

  //Claimant response below here
  let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDateRejectRepaymentPlanCCJ(claimRef, '456', claimNumber);
  await api.waitForFinishedBusinessProcess();

  await I.click('Sign out');
  //Update notification based on jo release
  //await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  //const notification = judgmentRequestedCourtAgrees();
  //await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
});
