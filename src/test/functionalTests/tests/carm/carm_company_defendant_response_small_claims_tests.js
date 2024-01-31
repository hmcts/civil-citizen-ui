const config = require('../../../config');
const LoginSteps = require('../../features/home/steps/login');
const ResponseSteps = require('../../features/response/steps/lipDefendantResponseSteps');
const {unAssignAllUsers} = require('../../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('CARM - LiP Defendant Journey - Small claims track - Company');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType, carmEnabled, 'Company');
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber =  caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('LiP Defendant Response with Reject all claim', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterCompDetails(carmEnabled);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, rejectAll);
  await ResponseSteps.VerifyPaidLessPage();
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll);
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
}).tag('@carm');

AfterSuite(async  () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});
