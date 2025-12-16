const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  mediationCARMClaimantDefendant,
  judgmentRequestedClaimantDisagrees, nocForLip,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const nocSteps = require('../../../lrFeatures/noc/steps/nocSteps');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType, caseData, claimNumber, defendantName;

Feature('Response with PartAdmit-PayByInstallments - Small Claims & Fast Track').tag('@ui-part-admit @ui-nightly-prod');

Scenario('Response with PartAdmit-PayByInstallments Small Claims ClaimantReject', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantRejectForDefRespPartAdmitInstallmentsPayment(claimRef, '1345', 'small');
  await api.waitForFinishedBusinessProcess();

  const mediationCARMClaimantDefendantNotif = mediationCARMClaimantDefendant();
  await verifyNotificationTitleAndContent(claimNumber, mediationCARMClaimantDefendantNotif.title, mediationCARMClaimantDefendantNotif.content);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await verifyNotificationTitleAndContent(claimNumber, mediationCARMClaimantDefendantNotif.title, mediationCARMClaimantDefendantNotif.content);
}).tag('@ui-prod');

Scenario('Response with PartAdmit-PayByInstallments Fast Track ClaimantReject', async ({ api, I }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  defendantName = await caseData.respondent1.partyName;

  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantRejectForDefRespPartAdmitInstallmentsPayment(claimRef, '1236', 'fast');
  await api.waitForFinishedBusinessProcess();

  //Perform NoC
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(claimNumber, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);
}).tag('@ui-noc');

// TODO undo when part payment journey is restored
Scenario.skip('Response with PartAdmit-PayByInstallments Small Claims ClaimantAccept', async ({
  I,
  api,
}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant response below here
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitInstallmentsPayment(claimRef, '1345', claimNumber);
  await api.waitForFinishedBusinessProcess();

  //Once the defect CIV-15577 is fixed, uncomment the below code.
  // const notification = claimantRejectPlanJudgeNewPlan();
  // await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const judgmentRequestedClaimantDisagreesNotif = judgmentRequestedClaimantDisagrees();
  await verifyNotificationTitleAndContent(claimNumber, judgmentRequestedClaimantDisagreesNotif.title, judgmentRequestedClaimantDisagreesNotif.content);
});

// TODO undo when part payment journey is restored
Scenario.skip('Response with PartAdmit-PayByInstallments Fast Track ClaimantAccept', async ({ api }) => {
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