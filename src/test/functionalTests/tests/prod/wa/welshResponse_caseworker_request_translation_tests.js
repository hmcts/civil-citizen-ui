const config = require('../../../../config');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const sharedData = require('../../../sharedData');
// const UploadTranslatedDocumentsSteps = require('../../caseworkerFeatures/uploadTranslatedDocuments/steps/uploadTranslatedDocumentsSteps');
// const CaseworkerDashboardSteps = require('../../caseworkerFeatures/caseworkerDashboard/steps/caseworkerDashboardSteps');
// const defendantWelshRequestTaskDetails = require('../../specClaimHelpers/fixtures/waTaskDetails/defendantWelshRequestTaskDetails');

const dontWantMoreTime = 'dontWantMoreTime';
const bySetDate = 'bySetDate';
const partAdmit = 'partial-admission';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Welsh Response with PartAdmit - Small Claims @nightly').tag('@regression-cui-r1');

Scenario('Create spec LR v LIP and assign to defendant LIP', async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
});

Scenario('Welsh Response with PartAdmit - SetDate @citizenUI @partAdmit', async () => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef, 'cy');
  await ResponseSteps.EnterPersonalDetails(claimRef, false);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, bySetDate);
  await ResponseSteps.EnterDateToPayOn();
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef, true, false);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  sharedData.language = 'en';
});

/*
Scenario('Caseworker Uploads Translated Documents', async ({wa}) => {
  await LoginSteps.EnterCaseworkerCredentials(config.caseWorker.email, config.caseWorker.password);
  await CaseworkerDashboardSteps.NavigateToCaseDetails(claimRef);
  const taskSteps = async () => {
    await UploadTranslatedDocumentsSteps.UploadTranslatedDocuments(claimRef);
    await UploadTranslatedDocumentsSteps.CheckAndSubmit();
    await UploadTranslatedDocumentsSteps.VerifySuccessBanner(claimRef);
  };
  await wa.runWATask(
    config.caseWorker,
    claimRef,
    config.waTaskTypes.defendantWelshRequest,
    defendantWelshRequestTaskDetails,
    taskSteps,
  );
});
*/
