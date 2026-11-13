const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CancelUnissuedClaimSteps = require('../../../citizenFeatures/cancelUnissuedClaim/steps/cancelUnissuedClaim');

const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  cancelUnissuedClaim,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData,caseRef,claimNumber;

Feature('Cancel Unissued Lip v Lip claim').tag('@ui-cancel-unissued-claim');

Scenario('Cancel Unissued Lip v Lip claim', async ({
  I,
  api,
}) => {
  const selectedHWF = false;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await CancelUnissuedClaimSteps.ClickCancelUnissuedClaimLink(caseRef);
  await CancelUnissuedClaimSteps.VerifyPageContent();
  await CancelUnissuedClaimSteps.EnterCancelReason('Test reason for cancelling the claim');
  await CancelUnissuedClaimSteps.ClickCancelUnissuedClaim();
  await CancelUnissuedClaimSteps.VerifyConfirmationPage();
  await api.waitForFinishedBusinessProcess();
  await CancelUnissuedClaimSteps.ClickGoToYourAccount();

  await I.click(claimNumber);
  const claimantNotification = cancelUnissuedClaim();
  await verifyNotificationTitleAndContent(claimNumber, claimantNotification.title, claimantNotification.content, caseRef);
}).tag('@civil-citizen-pr @thin-full-stack');

