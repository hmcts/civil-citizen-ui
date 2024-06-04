const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {goToHearingPartAdmit, judgmentRequestedClaimantDisagrees} = require('../../specClaimHelpers/dashboardNotificationConstants');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType, caseData, claimNumber;

Feature('Response with PartAdmit-PayByInstallments - Small Claims & Fast Track ');

Scenario('Response with PartAdmit-PayByInstallments Small Claims ClaimantReject @citizenUI @partAdmit @nightly - @api', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
      await I.click('Sign out');
      await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
      const notification = goToHearingPartAdmit(1345);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    }
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-PayByInstallments Fast Track ClaimantReject @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
  }
}).tag('"regression-r2');

Scenario('Response with PartAdmit-PayByInstallments Small Claims ClaimantAccept @citizenUI @partAdmit @nightly - @api', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    // CIV-13483 test to be put in here
    // if (isDashboardServiceEnabled) {
    //   const notification = ();
    //   await verifyNotificationTitleAndContent
    // }

    if (isDashboardServiceEnabled) {
      await I.click('Sign out');
      await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
      const notification = judgmentRequestedClaimantDisagrees();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
    }
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-PayByInstallments Fast Track ClaimantAccept @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
  }
}).tag('@regression-r2');