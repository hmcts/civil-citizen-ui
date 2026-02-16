const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const { claimantNotificationFullAdmitPayImmediately, mediationCARMClaimantDefendant } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {
  verifyNotificationTitleAndContent,
  verifyTasklistLinkAndState,
} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { viewMediationDocuments, uploadMediationDocuments, viewMediationSettlementAgreement } = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef, caseData, claimNumber, securityCode, taskListItem;

Feature('LiP vs LiP - CARM - Claimant and Defendant Journey - Individual').tag('@civil-citizen-nightly @ui-mediation');

Before(async () => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
});

Scenario('01 LiP Defendant response with Part admit', async ({ api }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled);
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef, false);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, 'immediate');
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmAltPhoneDetails();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.EnterUnavailableDates(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef, true);
  await ResponseSteps.submitResponse(claimRef, partAdmit);
  await ResponseSteps.VerifyConfirmationPage('PartAdmitAndPayImmediately');
});

Scenario('02 LiP Claimant response with Part admit', async ({ api }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.RespondToClaimAsClaimant(claimRef, claimantNotificationFullAdmitPayImmediately(500));
  await ClaimantResponseSteps.verifyDefendantResponse();
  await ClaimantResponseSteps.acceptOrRejectDefendantResponse('No');
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmAltPhoneDetails();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.EnterUnavailableDates(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef, true);
  await ClaimantResponseSteps.verifyClaimantMediationDetailsInCYA(claimRef);
  await ClaimantResponseSteps.submitClaimantResponse();
  await api.waitForFinishedBusinessProcess();
});

Scenario('03 Verify Mediation status before Unsuccessful mediation', async () => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const mediationCARMClaimantDefendantNotif = mediationCARMClaimantDefendant();
  await verifyNotificationTitleAndContent(claimNumber, mediationCARMClaimantDefendantNotif.title, mediationCARMClaimantDefendantNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
});