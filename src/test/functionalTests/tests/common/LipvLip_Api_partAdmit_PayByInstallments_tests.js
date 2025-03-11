const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {
  mediationCARMClaimantDefendant,
  goToHearingPartAdmitDefendant,
  judgmentRequestedClaimantDisagrees,
} = require('../../specClaimHelpers/dashboardNotificationConstants');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType, caseData, claimNumber;

Feature('Response with PartAdmit-PayByInstallments - Small Claims & Fast Track').tag('@nightly');

Scenario('Response with PartAdmit-PayByInstallments Small Claims ClaimantReject @citizenUI @partAdmit @nightly - @api', async ({
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
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantRejectForDefRespPartAdmitInstallmentsPayment(claimRef, '1345', 'small');
  await api.waitForFinishedBusinessProcess();

  if (isDashboardServiceEnabled) {
    const notification = mediationCARMClaimantDefendant();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  }

  if (isDashboardServiceEnabled) {
    await I.click('Sign out');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const notification = mediationCARMClaimantDefendant();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  }
}).tag('@regression-cui-r2');

Scenario('Response with PartAdmit-PayByInstallments Fast Track ClaimantReject @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantRejectForDefRespPartAdmitInstallmentsPayment(claimRef, '1236', 'fast');
  await api.waitForFinishedBusinessProcess();
});

Scenario('Response with PartAdmit-PayByInstallments Small Claims ClaimantAccept @citizenUI @partAdmit @nightly - @api', async ({
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
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitInstallmentsPayment(claimRef, '1345', claimNumber);
  await api.waitForFinishedBusinessProcess();

  //Once the defect CIV-15577 is fixed, uncomment the below code.
  // if (isDashboardServiceEnabled) {
  //   const notification = claimantRejectPlanJudgeNewPlan();
  //   await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  // }

  if (isDashboardServiceEnabled) {
    await I.click('Sign out');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const notification = judgmentRequestedClaimantDisagrees();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  }
});

Scenario('Response with PartAdmit-PayByInstallments Fast Track ClaimantAccept @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitInstallmentsPayment(claimRef, '1236', claimNumber);
  await api.waitForFinishedBusinessProcess();
});
