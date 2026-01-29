const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const UploadDocSteps = require('../../../citizenFeatures/response/steps/uploadDocSteps');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { claimantNotificationWithDefendantFullDefenceOrPartAdmitAlreadyPaid, mediationUnsuccessfulClaimant1NonAttendance } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { viewMediationDocuments, uploadMediationDocuments } = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef, caseData, claimNumber, securityCode, taskListItem, paidDate;

const currentDate = new Date();
const paymentDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);

Feature('LiP vs LiP - CARM - Claimant and Defendant Journey - Company').tag('@ui-nightly-prod');

Before(async () => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
});

Scenario('01 LiP Defendant Response with Reject all claim', async ({ api }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'Company');
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
  await ResponseSteps.EnterCompDetails(false);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, rejectAll);
  await ResponseSteps.VerifyPaidLessPage();
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll, caseData.totalClaimAmount);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmContactPerson();
  await ResponseSteps.ConfirmPhoneDetails();
  await ResponseSteps.ConfirmEmailDetails();
  await ResponseSteps.EnterUnavailableDates();
  await ResponseSteps.EnterDQForSmallClaims(claimRef, false);
  await ResponseSteps.verifyMediationDetailsInCYA(claimRef);
  await ResponseSteps.clickEmailChangeLink();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.clickSaveButton();
  await ResponseSteps.clickSaveButton();
  await ResponseSteps.verifyEditedEmailDetails();
  await ResponseSteps.fillStatementOfTruthAndSubmit();
  await ResponseSteps.VerifyConfirmationPage('RejectsAndLessThanClaimAmount');
  await api.waitForFinishedBusinessProcess();
});

Scenario('02 LiP Claimant Response with Reject all claim', async ({ api }) => {
  paidDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(paymentDate);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.RespondToClaimAsClaimant(claimRef, claimantNotificationWithDefendantFullDefenceOrPartAdmitAlreadyPaid(500, paidDate));
  await ClaimantResponseSteps.verifyDefendantResponse();
  await ClaimantResponseSteps.isDefendantPaid('No');
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmContactPerson();
  await ResponseSteps.ConfirmPhoneDetails();
  await ResponseSteps.ConfirmEmailDetails();
  await ResponseSteps.EnterUnavailableDates();
  await ResponseSteps.EnterDQForSmallClaimsForClaimant(claimRef, false);
  await ClaimantResponseSteps.verifyMediationDetailsInCYA(claimRef);
  await ClaimantResponseSteps.clickEmailChangeLink();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.clickSaveButton();
  await ResponseSteps.clickSaveButton();
  await ClaimantResponseSteps.verifyEditedEmailDetails();
  await api.waitForFinishedBusinessProcess();
});

Scenario('03 Caseworker perform mediation unsuccessful', async ({ api }) => {
  // Take Mediation Unsuccessful
  await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE', 'NOT_CONTACTABLE_DEFENDANT_ONE']);
  await api.waitForFinishedBusinessProcess();
});

Scenario('04 LiP claimant uploads mediation documents', async ({ api }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const mediationUnsuccessfulClaimant1NonAttendanceNotif = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulClaimant1NonAttendanceNotif.title, mediationUnsuccessfulClaimant1NonAttendanceNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
  await ClaimantResponseSteps.StartUploadDocs();
  await UploadDocSteps.VerifyDocuments();
  await UploadDocSteps.SelectDocuments('Your statement');
  await UploadDocSteps.SelectDocuments('Documents referred to in the statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.VerifyUploadDocumentsPage();
  await UploadDocSteps.ClickBackButton();
  await UploadDocSteps.UnSelectDocuments('Documents referred to in the statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.UploadDocuments('Your statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.ClickBackButton();
  await UploadDocSteps.ClickBackButton();
  await UploadDocSteps.SelectDocuments('Documents referred to in the statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.UploadDocuments('Documents referred to in the statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.CheckAndSendMediationDocs('Claimant');
  await UploadDocSteps.VerifyConfirmationPage();
  await api.waitForFinishedBusinessProcess();
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulClaimant1NonAttendanceNotif.title, mediationUnsuccessfulClaimant1NonAttendanceNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
  await ClaimantResponseSteps.ViewMediationDocs();
});

Scenario('05 LiP defendant uploads mediation documents', async ({ api }) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const mediationUnsuccessfulClaimant1NonAttendanceNotif = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulClaimant1NonAttendanceNotif.title, mediationUnsuccessfulClaimant1NonAttendanceNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
  await ClaimantResponseSteps.StartUploadDocs();
  await UploadDocSteps.VerifyDocuments();
  await UploadDocSteps.SelectDocuments('Your statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.UploadDocuments('Your statement');
  await UploadDocSteps.ClickContinue();
  await UploadDocSteps.CheckAndSendMediationDocs('Defendant');
  await UploadDocSteps.VerifyConfirmationPage();
  await ClaimantResponseSteps.ClickAndViewDocs();
  await api.waitForFinishedBusinessProcess();
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulClaimant1NonAttendanceNotif.title, mediationUnsuccessfulClaimant1NonAttendanceNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulClaimant1NonAttendanceNotif.title, mediationUnsuccessfulClaimant1NonAttendanceNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
});